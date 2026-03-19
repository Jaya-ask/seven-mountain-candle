const categoryDefinitions = [
  { id: "floral", name: "Floral Designs" },
  { id: "celebration", name: "Celebration Candles" },
  { id: "holiday", name: "Holiday & Festive" },
  { id: "faith", name: "Faith & Keepsakes" },
  { id: "love", name: "Love & Relationships" },
  { id: "ocean", name: "Ocean & Nature" },
  { id: "vessels", name: "Bowls, Pots & Jars" },
  { id: "pillars", name: "Pillars & Sculptural" },
  { id: "signature", name: "Signature Shapes" }
];

const categoryLookupById = Object.fromEntries(
  categoryDefinitions.map((category) => [category.id, category.name])
);

const defaultCategoryId = "signature";

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

const rawProducts = [
  { sku: "SMC0001", categoryIds: ["pillars"], name: "Garden wall", uom: "Each", material: 33.12, packing: 8.24, price: 41.36 },
  { sku: "SMC0002", categoryIds: ["floral"], name: "Rose Stand", uom: "Each", material: 14.84, packing: 8.24, price: 23.08 },
  { sku: "SMC0003", categoryIds: ["floral"], name: "Flower ribbon", uom: "Each", material: 23.12, packing: 8.24, price: 31.36 },
  { sku: "SMC0004", categoryIds: ["pillars"], name: "Soap Bar", uom: "Each", material: 25.27, packing: 8.24, price: 33.51 },
  { sku: "SMC0005", categoryIds: ["holiday"], name: "Samll Xmas tree", uom: "Each", material: 9.68, packing: 8.24, price: 17.92 },
  { sku: "SMC0006", categoryIds: ["floral"], name: "Blossom Rose", uom: "Each", material: 6.88, packing: 8.24, price: 15.12 },
  { sku: "SMC0007", categoryIds: ["floral"], name: "Three Roses", uom: "Each", material: 6.13, packing: 8.24, price: 14.37 },
  { sku: "SMC0008", categoryIds: ["holiday"], name: "Medium Xmas tree", uom: "Each", material: 19.89, packing: 8.24, price: 28.14 },
  { sku: "SMC0009", categoryIds: ["holiday"], name: "Merry Christmas in tree", uom: "Each", material: 7.2, packing: 8.24, price: 15.45 },
  { sku: "SMC0010", categoryIds: ["floral"], name: "Daisy Flower", uom: "Each", material: 2.47, packing: 8.24, price: 10.72 },
  { sku: "SMC0011", categoryIds: ["love"], name: "Samll Teddy bear", uom: "Each", material: 2.04, packing: 8.24, price: 10.29 },
  { sku: "SMC0012", categoryIds: ["floral"], name: "Four Flowers", uom: "Each", material: 9.46, packing: 8.24, price: 17.71 },
  { sku: "SMC0013", categoryIds: ["pillars"], name: "Polygon", uom: "Each", material: 44.84, packing: 8.24, price: 53.08 },
  { sku: "SMC0014", categoryIds: ["love"], name: "Heart in Hand", uom: "Each", material: 6.13, packing: 8.24, price: 14.37 },
  { sku: "SMC0015", categoryIds: ["pillars"], name: "Four balls", uom: "Each", material: 71.51, packing: 8.24, price: 79.75 },
  { sku: "SMC0016", categoryIds: ["floral"], name: "Flower bundle", uom: "Each", material: 11.83, packing: 8.24, price: 20.07 },
  { sku: "SMC0017", categoryIds: ["love"], name: "Heart", uom: "Each", material: 3.23, packing: 8.24, price: 11.47 },
  { sku: "SMC0018", categoryIds: ["floral"], name: "Tiny Roses", uom: "Each", material: 0.32, packing: 8.24, price: 8.57 },
  { sku: "SMC0019", categoryIds: ["floral"], name: "Tiny Sunflowers", uom: "Each", material: 1.51, packing: 8.24, price: 9.75 },
  { sku: "SMC0020", categoryIds: ["floral"], name: "Tiny Periwinke flowers", uom: "Each", material: 0.75, packing: 8.24, price: 9 },
  { sku: "SMC0021", categoryIds: ["floral"], name: "Six roses", uom: "Each", material: 8.28, packing: 8.24, price: 16.52 },
  { sku: "SMC0022", categoryIds: ["floral"], name: "Decrotive Flower", uom: "Each", material: 1.61, packing: 8.24, price: 9.86 },
  { sku: "SMC0023", categoryIds: ["celebration"], name: "Cloud Happy birthday", uom: "Each", material: 1.61, packing: 8.24, price: 9.86 },
  { sku: "SMC0024", categoryIds: ["celebration"], name: "Arrow Happy birthday", uom: "Each", material: 3.44, packing: 8.24, price: 11.68 },
  { sku: "SMC0025", categoryIds: ["celebration"], name: "Happy Birthday", uom: "Each", material: 1.29, packing: 8.24, price: 9.53 },
  { sku: "SMC0026", categoryIds: ["celebration"], name: "Heart Happy birthday", uom: "Each", material: 2.15, packing: 8.24, price: 10.39 },
  { sku: "SMC0027", categoryIds: ["celebration"], name: "Cake Happy birthday", uom: "Each", material: 2.47, packing: 8.24, price: 10.72 },
  { sku: "SMC0028", categoryIds: ["celebration"], name: "Tie Happy birthday", uom: "Each", material: 1.61, packing: 8.24, price: 9.86 },
  { sku: "SMC0029", categoryIds: ["love"], name: "Tiny Heart", uom: "Each", material: 14.75, packing: 8.24, price: 23 },
  { sku: "SMC0030", categoryIds: ["faith"], name: "Jesus", uom: "Each", material: 39.87, packing: 8.24, price: 48.12 },
  { sku: "SMC0031", categoryIds: ["faith"], name: "Cross Faith", uom: "Each", material: 5.43, packing: 8.24, price: 13.67 },
  { sku: "SMC0032", categoryIds: ["floral"], name: "Flower petals", uom: "Each", material: 1.65, packing: 8.24, price: 9.89 },
  { sku: "SMC0033", categoryIds: ["floral"], name: "Cherry blossom", uom: "Each", material: 1.05, packing: 8.24, price: 9.3 },
  { sku: "SMC0034", categoryIds: ["ocean"], name: "Fish moulds", uom: "Each", material: 0.78, packing: 8.24, price: 9.03 },
  { sku: "SMC0035", categoryIds: ["floral"], name: "Tiny Sunflower", uom: "Each", material: 0.98, packing: 8.24, price: 9.22 },
  { sku: "SMC0036", categoryIds: ["floral"], name: "Lotus petals", uom: "Each", material: 0.86, packing: 8.24, price: 9.1 },
  { sku: "SMC0037", categoryIds: ["faith"], name: "Designer Cross", uom: "Each", material: 4.06, packing: 8.24, price: 12.31 },
  { sku: "SMC0038", categoryIds: ["celebration"], name: "Balloon", uom: "Each", material: 0.82, packing: 8.24, price: 9.06 },
  { sku: "SMC0039", categoryIds: ["pillars"], name: "Medium Pillar", uom: "Each", material: 27, packing: 8.24, price: 35.24 },
  { sku: "SMC0040", categoryIds: ["pillars"], name: "Samll Pillar", uom: "Each", material: 15.86, packing: 8.24, price: 24.1 },
  { sku: "SMC0041", categoryIds: ["pillars"], name: "Long Pillar", uom: "Each", material: 6.42, packing: 8.24, price: 14.66 },
  { sku: "SMC0042", categoryIds: ["ocean"], name: "Sea shell", uom: "Each", material: 12.43, packing: 8.24, price: 20.67 },
  { sku: "SMC0043", categoryIds: ["holiday"], name: "Moon", uom: "Each", material: 11.54, packing: 8.24, price: 19.78 },
  { sku: "SMC0044", categoryIds: ["floral"], name: "Lotus Bud", uom: "Each", material: 9.34, packing: 8.24, price: 17.59 },
  { sku: "SMC0045", categoryIds: ["floral"], name: "Red Rose", uom: "Each", material: 6.84, packing: 8.24, price: 15.08 },
  { sku: "SMC0046", categoryIds: ["floral"], name: "Dahlia Flower", uom: "Each", material: 1.89, packing: 8.24, price: 10.14 },
  { sku: "SMC0047", categoryIds: ["floral"], name: "Flowere Rangoli", uom: "Each", material: 8.39, packing: 8.24, price: 16.63 },
  { sku: "SMC0048", categoryIds: ["pillars"], name: "Designer Rangoli", uom: "Each", material: 8.03, packing: 8.24, price: 16.28 },
  { sku: "SMC0049", categoryIds: ["ocean"], name: "Butterfly", uom: "Each", material: 1.27, packing: 8.24, price: 9.51 },
  { sku: "SMC0050", categoryIds: ["vessels"], name: "Urli", uom: "Each", material: 2.4, packing: 8.24, price: 10.64 },
  { sku: "SMC0051", categoryIds: ["love"], name: "Kiss in Heart", uom: "Each", material: 15.34, packing: 8.24, price: 23.59 },
  { sku: "SMC0052", categoryIds: ["love"], name: "Engaged", uom: "Each", material: 4.13, packing: 8.24, price: 12.37 },
  { sku: "SMC0053", categoryIds: ["floral"], name: "Pansy Flower", uom: "Each", material: 1.63, packing: 8.24, price: 9.88 },
  { sku: "SMC0054", categoryIds: ["floral"], name: "Small Red rose", uom: "Each", material: 2.63, packing: 8.24, price: 10.88 },
  { sku: "SMC0055", categoryIds: ["love"], name: "Hug", uom: "Each", material: 12.87, packing: 8.24, price: 21.11 },
  { sku: "SMC0056", categoryIds: ["floral"], name: "Flower Blinded", uom: "Each", material: 14.99, packing: 8.24, price: 23.23 },
  { sku: "SMC0057", categoryIds: ["love"], name: "Blinded", uom: "Each", material: 15.69, packing: 8.24, price: 23.93 },
  { sku: "SMC0058", categoryIds: ["floral"], name: "Set of flowers", uom: "Each", material: 5.75, packing: 8.24, price: 14 },
  { sku: "SMC0060", categoryIds: ["holiday"], name: "Merry christmas", uom: "Each", material: 10.4, packing: 8.24, price: 18.64 },
  { sku: "SMC0061", categoryIds: ["love"], name: "Heartin Teddy bear", uom: "Each", material: 34.5, packing: 8.24, price: 42.74 },
  { sku: "SMC0062", categoryIds: ["faith"], name: "Simple Cross", uom: "Each", material: 10.44, packing: 8.24, price: 18.68 },
  { sku: "SMC0063", categoryIds: ["signature"], name: "Beauty in Gargen", uom: "Each", material: 71.93, packing: 8.24, price: 80.17 },
  { sku: "SMC0064", categoryIds: ["ocean"], name: "Sea animals", uom: "Each", material: 17.11, packing: 8.24, price: 25.35 },
  { sku: "SMC0065", categoryIds: ["ocean"], name: "Leaves", uom: "Each", material: 12.89, packing: 8.24, price: 21.14 },
  { sku: "SMC0066", categoryIds: ["ocean"], name: "Deep Ocean", uom: "Each", material: 6.17, packing: 8.24, price: 14.42 },
  { sku: "SMC0067", categoryIds: ["love"], name: "Tiny Heart", uom: "Each", material: 15.31, packing: 8.24, price: 23.56 },
  { sku: "SMC0068", categoryIds: ["celebration"], name: "Letters", uom: "Each", material: 8.23, packing: 8.24, price: 16.47 },
  { sku: "SMC0069", categoryIds: ["celebration"], name: "Big Letters", uom: "Each", material: 20.81, packing: 8.24, price: 29.05 },
  { sku: "SMC0070", categoryIds: ["celebration"], name: "Cup cake", uom: "Each", material: 74.93, packing: 8.24, price: 83.17 },
  { sku: "SMC0072", categoryIds: ["ocean"], name: "Spread wings", uom: "Each", material: 11.96, packing: 8.24, price: 20.2 },
  { sku: "SMC0073", categoryIds: ["floral"], name: "Daisy flowers", uom: "Each", material: 2.04, packing: 8.24, price: 10.29 },
  { sku: "SMC0075", categoryIds: ["signature"], name: "Beauty in Gargen Small", uom: "Each", material: 27.93, packing: 8.24, price: 36.17 },
  { sku: "SMC0076", categoryIds: ["holiday"], name: "Moon & Star", uom: "Each", material: 0.87, packing: 8.24, price: 9.11 },
  { sku: "SMC0077", categoryIds: ["ocean"], name: "Lion", uom: "Each", material: 3.26, packing: 8.24, price: 11.5 },
  { sku: "SMC0078", categoryIds: ["floral"], name: "Flower", uom: "Each", material: 1.8, packing: 8.24, price: 10.04 },
  { sku: "SMC0079", categoryIds: ["holiday"], name: "Kareem", uom: "Each", material: 8.11, packing: 8.24, price: 16.35 },
  { sku: "SMC0080", categoryIds: ["holiday"], name: "Mosque", uom: "Each", material: 9.23, packing: 8.24, price: 17.47 },
  { sku: "SMC0081", categoryIds: ["celebration"], name: "Music fonts", uom: "Each", material: 4.27, packing: 8.24, price: 12.51 },
  { sku: "SMC0082", categoryIds: ["celebration"], name: "Bell", uom: "Each", material: 18.66, packing: 8.24, price: 26.9 },
  { sku: "SMC0083", categoryIds: ["love"], name: "Dad & Son", uom: "Each", material: 30.53, packing: 8.24, price: 38.77 },
  { sku: "SMC0084", categoryIds: ["signature"], name: "Teachers special", uom: "Each", material: 32.09, packing: 8.24, price: 40.33 },
  { sku: "SMC0085", categoryIds: ["floral"], name: "3 Roses", uom: "Each", material: 24.51, packing: 8.24, price: 32.75 },
  { sku: "SMC0086", categoryIds: ["ocean"], name: "Shell", uom: "Each", material: 8.25, packing: 8.24, price: 16.49 },
  { sku: "SMC0087", categoryIds: ["vessels"], name: "Bowl curved mouth", uom: "Each", material: 18.35, packing: 8.24, price: 26.59 },
  { sku: "SMC0088", categoryIds: ["holiday"], name: "Star", uom: "Each", material: 11.46, packing: 8.24, price: 19.71 },
  { sku: "SMC0089", categoryIds: ["vessels"], name: "Resin Candy jar", uom: "Each", material: 18.37, packing: 8.24, price: 26.61 },
  { sku: "SMC0090", categoryIds: ["love"], name: "Twin hearts", uom: "Each", material: 11.33, packing: 8.24, price: 19.58 },
  { sku: "SMC0091", categoryIds: ["vessels"], name: "Small Bowl", uom: "Each", material: 12.21, packing: 8.24, price: 20.45 },
  { sku: "SMC0092", categoryIds: ["vessels"], name: "Small pot", uom: "Each", material: 26.53, packing: 8.24, price: 34.77 },
  { sku: "SMC0093", categoryIds: ["vessels"], name: "Bath tub", uom: "Each", material: 31.33, packing: 8.24, price: 39.57 },
  { sku: "SMC0094", categoryIds: ["vessels"], name: "Resin candy jar cap", uom: "Each", material: 7.73, packing: 8.24, price: 15.97 },
  { sku: "SMC0095", categoryIds: ["ocean"], name: "Mountain", uom: "Each", material: 21.8, packing: 8.24, price: 30.04 },
  { sku: "SMC0096", categoryIds: ["love"], name: "You & Me", uom: "Each", material: 13.21, packing: 8.24, price: 21.46 },
  { sku: "SMC0097", categoryIds: ["ocean"], name: "Waves", uom: "Each", material: 22.02, packing: 8.24, price: 30.26 },
  { sku: "SMC0098", categoryIds: ["vessels"], name: "Pot", uom: "Each", material: 94.73, packing: 8.24, price: 102.97 }
];

export const products = rawProducts.map((product, index) => {
  const categoryIds = product.categoryIds ?? [defaultCategoryId];
  const categoryNames = categoryIds.map((categoryId) => categoryLookupById[categoryId] ?? categoryLookupById[defaultCategoryId]);
  const primaryCategory = categoryNames[0];

  return {
    id: slugify(product.sku),
    sku: product.sku,
    name: product.name,
    category: primaryCategory,
    categoryIds,
    categories: categoryNames,
    price: product.price,
    uom: product.uom,
    material: product.material,
    packing: product.packing,
    description: `${product.uom} piece candle. Material ${product.material.toFixed(2)}, packing ${product.packing.toFixed(2)}.`,
    notes: [product.sku, ...categoryNames, product.uom],
    colors: getPalette(product.name),
    featured: index < 6 || product.price >= 40
  };
});

export const categories = categoryDefinitions
  .filter((category) =>
    products.some((product) => product.categoryIds.includes(category.id))
  );
