import express from "express";
import cors from "cors";
import pg from "pg";

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 5000;

const dbConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "password",
      database: process.env.PGDATABASE || "sevenmountain"
    };

const dbPool = new Pool(dbConfig);

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPalette(name) {
  const palettes = [
    ["#c9a27e", "#f3dfc7"],
    ["#b86c52", "#eac6ae"],
    ["#8d9b7d", "#dfe7cf"],
    ["#6b7c8f", "#d1dae3"],
    ["#b7905f", "#efdcb8"],
    ["#80605a", "#dfcbc6"]
  ];

  const seed = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return palettes[seed % palettes.length];
}

async function getCatalogDataFromDb() {
  const [categoriesResult, productsResult] = await Promise.all([
    dbPool.query(`
      SELECT id, name
      FROM category
      ORDER BY name
    `),
    dbPool.query(`
      SELECT
        p.sku,
        p.name,
        p.uom,
        p.material,
        p.packing,
        p.price,
        COALESCE(array_agg(DISTINCT c.id) FILTER (WHERE c.id IS NOT NULL), '{}'::text[]) AS category_ids,
        COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}'::text[]) AS category_names,
        COALESCE((
          SELECT pi.image_url
          FROM product_image pi
          WHERE pi.product_sku = p.sku
          ORDER BY pi.is_primary DESC, pi.sort_order ASC, pi.created_at ASC
          LIMIT 1
        ), '') AS image_url
      FROM product p
      LEFT JOIN product_category pc ON pc.product_sku = p.sku
      LEFT JOIN category c ON c.id = pc.category_id
      GROUP BY p.sku, p.name, p.uom, p.material, p.packing, p.price
      ORDER BY p.sku
    `)
  ]);

  const products = productsResult.rows.map((row, index) => {
    const categoryIds = row.category_ids.length ? row.category_ids : ["signature"];
    const categories = row.category_names.length ? row.category_names : ["Signature Shapes"];
    const category = categories[0];

    return {
      id: slugify(row.sku),
      sku: row.sku,
      name: row.name,
      category,
      categoryIds,
      categories,
      price: Number(row.price),
      uom: row.uom,
      material: Number(row.material),
      packing: Number(row.packing),
      imageUrl: row.image_url || null,
      description: `${row.uom} piece candle. Material ${Number(row.material).toFixed(2)}, packing ${Number(row.packing).toFixed(2)}.`,
      notes: [row.sku, ...categories, row.uom],
      colors: getPalette(row.name),
      featured: index < 6 || Number(row.price) >= 40
    };
  });

  return {
    categories: categoriesResult.rows,
    products
  };
}

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_request, response) => {
  try {
    await dbPool.query("SELECT 1");
    response.json({ ok: true, database: process.env.PGDATABASE || "sevenmountain" });
  } catch (error) {
    response.status(503).json({ ok: false, message: "Database unavailable." });
  }
});

app.get("/api/catalog", async (_request, response) => {
  try {
    const catalogData = await getCatalogDataFromDb();

    response.json({
      categories: catalogData.categories,
      products: catalogData.products
    });
  } catch (error) {
    console.error("Failed to load catalog data", error);
    response.status(500).json({
      message: "Failed to load catalog data."
    });
  }
});

app.get("/api/products", async (request, response) => {
  try {
    const category = request.query.category?.toString().toLowerCase();
    const search = request.query.search?.toLowerCase();
    const { products } = await getCatalogDataFromDb();

    const filtered = products.filter((product) => {
      const categoryMatch =
        !category ||
        product.categoryIds.some((categoryId) => categoryId.toLowerCase() === category) ||
        product.categories.some((categoryName) => categoryName.toLowerCase() === category) ||
        product.category.toLowerCase() === category;
      const searchMatch =
        !search ||
        `${product.name} ${product.description} ${product.notes.join(" ")}`
          .toLowerCase()
          .includes(search);

      return categoryMatch && searchMatch;
    });

    response.json(filtered);
  } catch (error) {
    console.error("Failed to load products", error);
    response.status(500).json({
      message: "Failed to load products."
    });
  }
});

app.get("/api/products/featured", async (_request, response) => {
  try {
    const { products } = await getCatalogDataFromDb();
    response.json(products.filter((product) => product.featured));
  } catch (error) {
    console.error("Failed to load featured products", error);
    response.status(500).json({
      message: "Failed to load featured products."
    });
  }
});

app.post("/api/orders", async (request, response) => {
  const { customer, items } = request.body;

  if (!customer?.name || !customer?.email || !Array.isArray(items) || items.length === 0) {
    response.status(400).json({
      message: "Customer name, email, and at least one cart item are required."
    });
    return;
  }

  let subtotal = 0;

  try {
    const { products } = await getCatalogDataFromDb();

    subtotal = items.reduce((sum, item) => {
      const product = products.find((entry) => entry.id === item.id || entry.sku === item.id);
      if (!product) {
        return sum;
      }
      return sum + product.price * item.quantity;
    }, 0);
  } catch (error) {
    console.error("Failed to calculate order subtotal", error);
    response.status(500).json({
      message: "Failed to calculate subtotal."
    });
    return;
  }

  response.status(201).json({
    orderId: `SM-${Date.now()}`,
    status: "received",
    subtotal,
    customer
  });
});

app.listen(port, () => {
  console.log(`Seven Mountains API listening on port ${port}`);
});
