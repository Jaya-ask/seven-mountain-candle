import express from "express";
import cors from "cors";
import { categories, products } from "./data/store.js";
import {
  packingItems,
  packingMeta,
  powderRecipes,
  powderSettings,
  rawMaterials,
  waxRecipes,
  waxSettings
} from "./data/supportingData.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/catalog", (_request, response) => {
  response.json({
    categories,
    products,
    supportingData: {
      powder: { settings: powderSettings, recipes: powderRecipes },
      packing: { settings: packingMeta, items: packingItems },
      rawMaterials,
      wax: { settings: waxSettings, recipes: waxRecipes }
    }
  });
});

app.get("/api/products", (request, response) => {
  const category = request.query.category;
  const search = request.query.search?.toLowerCase();

  const filtered = products.filter((product) => {
    const categoryMatch = !category || product.category === category;
    const searchMatch =
      !search ||
      `${product.name} ${product.description} ${product.notes.join(" ")}`
        .toLowerCase()
        .includes(search);

    return categoryMatch && searchMatch;
  });

  response.json(filtered);
});

app.get("/api/products/featured", (_request, response) => {
  response.json(products.filter((product) => product.featured));
});

app.post("/api/orders", (request, response) => {
  const { customer, items } = request.body;

  if (!customer?.name || !customer?.email || !Array.isArray(items) || items.length === 0) {
    response.status(400).json({
      message: "Customer name, email, and at least one cart item are required."
    });
    return;
  }

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.id);
    if (!product) {
      return sum;
    }
    return sum + product.price * item.quantity;
  }, 0);

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
