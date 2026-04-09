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

export function createProductModelFromRow(row, index) {
  const categoryIds = row.category_ids.length ? row.category_ids : ["signature"];
  const categories = row.category_names.length ? row.category_names : ["Signature Shapes"];
  const category = categories[0];
  const images = Array.isArray(row.images)
    ? row.images
        .filter((entry) => entry?.url)
        .map((entry) => ({
          url: entry.url,
          isPrimary: Boolean(entry.isPrimary),
          sortOrder: Number(entry.sortOrder) || 0
        }))
    : [];

  const galleryImages = images.map((entry) => entry.url);
  const primaryImageUrl = row.image_url || galleryImages[0] || null;
  const reviewCount = Number(row.review_count) || 0;
  const parsedRating = row.avg_rating === null || row.avg_rating === undefined
    ? null
    : Number(row.avg_rating);
  const tags = Array.isArray(row.tags)
    ? row.tags
        .filter((tag) => typeof tag === "string" && tag.trim() !== "" && tag.trim() !== "-")
        .map((tag) => tag.trim())
    : [];
  const fallbackDescription = `${row.name} is a hand-finished candle designed to bring warmth and character to your space. Its sculpted form makes it suitable for everyday decor and gifting. Crafted with material ${Number(row.material).toFixed(2)} and careful packing ${Number(row.packing).toFixed(2)}, it adds a premium accent to your home.`;
  const description = typeof row.description === "string" && row.description.trim() !== ""
    ? row.description.trim()
    : fallbackDescription;
  const notes = tags.length > 0 ? tags : [row.sku, ...categories, row.uom];

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
    rating: reviewCount > 0 && Number.isFinite(parsedRating) ? parsedRating : null,
    reviewCount,
    imageUrl: primaryImageUrl,
    primaryImageUrl,
    images,
    galleryImages,
    description,
    tags,
    notes,
    colors: getPalette(row.name),
    featured: index < 6 || Number(row.price) >= 40
  };
}

export function productMatchesCategory(product, category) {
  if (!category) {
    return true;
  }

  return (
    product.categoryIds.some((categoryId) => categoryId.toLowerCase() === category) ||
    product.categories.some((categoryName) => categoryName.toLowerCase() === category) ||
    product.category.toLowerCase() === category
  );
}

export function productMatchesSearch(product, search) {
  if (!search) {
    return true;
  }

  return `${product.name} ${product.description} ${product.notes.join(" ")}`
    .toLowerCase()
    .includes(search);
}
