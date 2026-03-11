const categoryRules = [
  { id: "floral", name: "Floral Designs", match: /rose|flower|dahlia|blossom|lotus|pansy|sunflower|petals|daisy|periwinke/i },
  { id: "celebration", name: "Celebration Candles", match: /birthday|cake|balloon|letters|bell|cup cake|music/i },
  { id: "holiday", name: "Holiday & Festive", match: /christmas|xmas|tree|kareem|mosque|star|moon/i },
  { id: "faith", name: "Faith & Keepsakes", match: /jesus|cross|faith/i },
  { id: "love", name: "Love & Relationships", match: /heart|hug|kiss|engaged|you & me|dad & son|teddy bear|blinded/i },
  { id: "ocean", name: "Ocean & Nature", match: /sea|shell|ocean|fish|leaves|mountain|waves|butterfly|lion|spread wings/i },
  { id: "vessels", name: "Bowls, Pots & Jars", match: /bowl|pot|jar|bath tub|urli/i },
  { id: "pillars", name: "Pillars & Sculptural", match: /pillar|polygon|balls|wall|stand|rangoli|soap bar/i }
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getCategory(name) {
  return categoryRules.find((rule) => rule.match.test(name)) ?? {
    id: "signature",
    name: "Signature Shapes"
  };
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
  { sku: "SMC0001", name: "Garden wall", uom: "Each", material: 33.12, packing: 8.24, price: 41.36 },
  { sku: "SMC0002", name: "Rose Stand", uom: "Each", material: 14.84, packing: 8.24, price: 23.08 },
  { sku: "SMC0003", name: "Flower ribbon", uom: "Each", material: 23.12, packing: 8.24, price: 31.36 },
  { sku: "SMC0004", name: "Soap Bar", uom: "Each", material: 25.27, packing: 8.24, price: 33.51 },
  { sku: "SMC0005", name: "Samll Xmas tree", uom: "Each", material: 9.68, packing: 8.24, price: 17.92 },
  { sku: "SMC0006", name: "Blossom Rose", uom: "Each", material: 6.88, packing: 8.24, price: 15.12 },
  { sku: "SMC0007", name: "Three Roses", uom: "Each", material: 6.13, packing: 8.24, price: 14.37 },
  { sku: "SMC0008", name: "Medium Xmas tree", uom: "Each", material: 19.89, packing: 8.24, price: 28.14 },
  { sku: "SMC0009", name: "Merry Christmas in tree", uom: "Each", material: 7.2, packing: 8.24, price: 15.45 },
  { sku: "SMC0010", name: "Daisy Flower", uom: "Each", material: 2.47, packing: 8.24, price: 10.72 },
  { sku: "SMC0011", name: "Samll Teddy bear", uom: "Each", material: 2.04, packing: 8.24, price: 10.29 },
  { sku: "SMC0012", name: "Four Flowers", uom: "Each", material: 9.46, packing: 8.24, price: 17.71 },
  { sku: "SMC0013", name: "Polygon", uom: "Each", material: 44.84, packing: 8.24, price: 53.08 },
  { sku: "SMC0014", name: "Heart in Hand", uom: "Each", material: 6.13, packing: 8.24, price: 14.37 },
  { sku: "SMC0015", name: "Four balls", uom: "Each", material: 71.51, packing: 8.24, price: 79.75 },
  { sku: "SMC0016", name: "Flower bundle", uom: "Each", material: 11.83, packing: 8.24, price: 20.07 },
  { sku: "SMC0017", name: "Heart", uom: "Each", material: 3.23, packing: 8.24, price: 11.47 },
  { sku: "SMC0018", name: "Tiny Roses", uom: "Each", material: 0.32, packing: 8.24, price: 8.57 },
  { sku: "SMC0019", name: "Tiny Sunflowers", uom: "Each", material: 1.51, packing: 8.24, price: 9.75 },
  { sku: "SMC0020", name: "Tiny Periwinke flowers", uom: "Each", material: 0.75, packing: 8.24, price: 9 },
  { sku: "SMC0021", name: "Six roses", uom: "Each", material: 8.28, packing: 8.24, price: 16.52 },
  { sku: "SMC0022", name: "Decrotive Flower", uom: "Each", material: 1.61, packing: 8.24, price: 9.86 },
  { sku: "SMC0023", name: "Cloud Happy birthday", uom: "Each", material: 1.61, packing: 8.24, price: 9.86 },
  { sku: "SMC0024", name: "Arrow Happy birthday", uom: "Each", material: 3.44, packing: 8.24, price: 11.68 },
  { sku: "SMC0025", name: "Happy Birthday", uom: "Each", material: 1.29, packing: 8.24, price: 9.53 },
  { sku: "SMC0026", name: "Heart Happy birthday", uom: "Each", material: 2.15, packing: 8.24, price: 10.39 },
  { sku: "SMC0027", name: "Cake Happy birthday", uom: "Each", material: 2.47, packing: 8.24, price: 10.72 },
  { sku: "SMC0028", name: "Tie Happy birthday", uom: "Each", material: 1.61, packing: 8.24, price: 9.86 },
  { sku: "SMC0029", name: "Tiny Heart", uom: "Each", material: 14.75, packing: 8.24, price: 23 },
  { sku: "SMC0030", name: "Jesus", uom: "Each", material: 39.87, packing: 8.24, price: 48.12 },
  { sku: "SMC0031", name: "Cross Faith", uom: "Each", material: 5.43, packing: 8.24, price: 13.67 },
  { sku: "SMC0032", name: "Flower petals", uom: "Each", material: 1.65, packing: 8.24, price: 9.89 },
  { sku: "SMC0033", name: "Cherry blossom", uom: "Each", material: 1.05, packing: 8.24, price: 9.3 },
  { sku: "SMC0034", name: "Fish moulds", uom: "Each", material: 0.78, packing: 8.24, price: 9.03 },
  { sku: "SMC0035", name: "Tiny Sunflower", uom: "Each", material: 0.98, packing: 8.24, price: 9.22 },
  { sku: "SMC0036", name: "Lotus petals", uom: "Each", material: 0.86, packing: 8.24, price: 9.1 },
  { sku: "SMC0037", name: "Designer Cross", uom: "Each", material: 4.06, packing: 8.24, price: 12.31 },
  { sku: "SMC0038", name: "Balloon", uom: "Each", material: 0.82, packing: 8.24, price: 9.06 },
  { sku: "SMC0039", name: "Medium Pillar", uom: "Each", material: 27, packing: 8.24, price: 35.24 },
  { sku: "SMC0040", name: "Samll Pillar", uom: "Each", material: 15.86, packing: 8.24, price: 24.1 },
  { sku: "SMC0041", name: "Long Pillar", uom: "Each", material: 6.42, packing: 8.24, price: 14.66 },
  { sku: "SMC0042", name: "Sea shell", uom: "Each", material: 12.43, packing: 8.24, price: 20.67 },
  { sku: "SMC0043", name: "Moon", uom: "Each", material: 11.54, packing: 8.24, price: 19.78 },
  { sku: "SMC0044", name: "Lotus Bud", uom: "Each", material: 9.34, packing: 8.24, price: 17.59 },
  { sku: "SMC0045", name: "Red Rose", uom: "Each", material: 6.84, packing: 8.24, price: 15.08 },
  { sku: "SMC0046", name: "Dahlia Flower", uom: "Each", material: 1.89, packing: 8.24, price: 10.14 },
  { sku: "SMC0047", name: "Flowere Rangoli", uom: "Each", material: 8.39, packing: 8.24, price: 16.63 },
  { sku: "SMC0048", name: "Designer Rangoli", uom: "Each", material: 8.03, packing: 8.24, price: 16.28 },
  { sku: "SMC0049", name: "Butterfly", uom: "Each", material: 1.27, packing: 8.24, price: 9.51 },
  { sku: "SMC0050", name: "Urli", uom: "Each", material: 2.4, packing: 8.24, price: 10.64 },
  { sku: "SMC0051", name: "Kiss in Heart", uom: "Each", material: 15.34, packing: 8.24, price: 23.59 },
  { sku: "SMC0052", name: "Engaged", uom: "Each", material: 4.13, packing: 8.24, price: 12.37 },
  { sku: "SMC0053", name: "Pansy Flower", uom: "Each", material: 1.63, packing: 8.24, price: 9.88 },
  { sku: "SMC0054", name: "Small Red rose", uom: "Each", material: 2.63, packing: 8.24, price: 10.88 },
  { sku: "SMC0055", name: "Hug", uom: "Each", material: 12.87, packing: 8.24, price: 21.11 },
  { sku: "SMC0056", name: "Flower Blinded", uom: "Each", material: 14.99, packing: 8.24, price: 23.23 },
  { sku: "SMC0057", name: "Blinded", uom: "Each", material: 15.69, packing: 8.24, price: 23.93 },
  { sku: "SMC0058", name: "Set of flowers", uom: "Each", material: 5.75, packing: 8.24, price: 14 },
  { sku: "SMC0060", name: "Merry christmas", uom: "Each", material: 10.4, packing: 8.24, price: 18.64 },
  { sku: "SMC0061", name: "Heartin Teddy bear", uom: "Each", material: 34.5, packing: 8.24, price: 42.74 },
  { sku: "SMC0062", name: "Simple Cross", uom: "Each", material: 10.44, packing: 8.24, price: 18.68 },
  { sku: "SMC0063", name: "Beauty in Gargen", uom: "Each", material: 71.93, packing: 8.24, price: 80.17 },
  { sku: "SMC0064", name: "Sea animals", uom: "Each", material: 17.11, packing: 8.24, price: 25.35 },
  { sku: "SMC0065", name: "Leaves", uom: "Each", material: 12.89, packing: 8.24, price: 21.14 },
  { sku: "SMC0066", name: "Deep Ocean", uom: "Each", material: 6.17, packing: 8.24, price: 14.42 },
  { sku: "SMC0067", name: "Tiny Heart", uom: "Each", material: 15.31, packing: 8.24, price: 23.56 },
  { sku: "SMC0068", name: "Letters", uom: "Each", material: 8.23, packing: 8.24, price: 16.47 },
  { sku: "SMC0069", name: "Big Letters", uom: "Each", material: 20.81, packing: 8.24, price: 29.05 },
  { sku: "SMC0070", name: "Cup cake", uom: "Each", material: 74.93, packing: 8.24, price: 83.17 },
  { sku: "SMC0072", name: "Spread wings", uom: "Each", material: 11.96, packing: 8.24, price: 20.2 },
  { sku: "SMC0073", name: "Daisy flowers", uom: "Each", material: 2.04, packing: 8.24, price: 10.29 },
  { sku: "SMC0075", name: "Beauty in Gargen Small", uom: "Each", material: 27.93, packing: 8.24, price: 36.17 },
  { sku: "SMC0076", name: "Moon & Star", uom: "Each", material: 0.87, packing: 8.24, price: 9.11 },
  { sku: "SMC0077", name: "Lion", uom: "Each", material: 3.26, packing: 8.24, price: 11.5 },
  { sku: "SMC0078", name: "Flower", uom: "Each", material: 1.8, packing: 8.24, price: 10.04 },
  { sku: "SMC0079", name: "Kareem", uom: "Each", material: 8.11, packing: 8.24, price: 16.35 },
  { sku: "SMC0080", name: "Mosque", uom: "Each", material: 9.23, packing: 8.24, price: 17.47 },
  { sku: "SMC0081", name: "Music fonts", uom: "Each", material: 4.27, packing: 8.24, price: 12.51 },
  { sku: "SMC0082", name: "Bell", uom: "Each", material: 18.66, packing: 8.24, price: 26.9 },
  { sku: "SMC0083", name: "Dad & Son", uom: "Each", material: 30.53, packing: 8.24, price: 38.77 },
  { sku: "SMC0084", name: "Teachers special", uom: "Each", material: 32.09, packing: 8.24, price: 40.33 },
  { sku: "SMC0085", name: "3 Roses", uom: "Each", material: 24.51, packing: 8.24, price: 32.75 },
  { sku: "SMC0086", name: "Shell", uom: "Each", material: 8.25, packing: 8.24, price: 16.49 },
  { sku: "SMC0087", name: "Bowl curved mouth", uom: "Each", material: 18.35, packing: 8.24, price: 26.59 },
  { sku: "SMC0088", name: "Star", uom: "Each", material: 11.46, packing: 8.24, price: 19.71 },
  { sku: "SMC0089", name: "Resin Candy jar", uom: "Each", material: 18.37, packing: 8.24, price: 26.61 },
  { sku: "SMC0090", name: "Twin hearts", uom: "Each", material: 11.33, packing: 8.24, price: 19.58 },
  { sku: "SMC0091", name: "Small Bowl", uom: "Each", material: 12.21, packing: 8.24, price: 20.45 },
  { sku: "SMC0092", name: "Small pot", uom: "Each", material: 26.53, packing: 8.24, price: 34.77 },
  { sku: "SMC0093", name: "Bath tub", uom: "Each", material: 31.33, packing: 8.24, price: 39.57 },
  { sku: "SMC0094", name: "Resin candy jar cap", uom: "Each", material: 7.73, packing: 8.24, price: 15.97 },
  { sku: "SMC0095", name: "Mountain", uom: "Each", material: 21.8, packing: 8.24, price: 30.04 },
  { sku: "SMC0096", name: "You & Me", uom: "Each", material: 13.21, packing: 8.24, price: 21.46 },
  { sku: "SMC0097", name: "Waves", uom: "Each", material: 22.02, packing: 8.24, price: 30.26 },
  { sku: "SMC0098", name: "Pot", uom: "Each", material: 94.73, packing: 8.24, price: 102.97 }
];

export const products = rawProducts.map((product, index) => {
  const category = getCategory(product.name);

  return {
    id: slugify(product.sku),
    sku: product.sku,
    name: product.name,
    category: category.name,
    price: product.price,
    uom: product.uom,
    material: product.material,
    packing: product.packing,
    description: `${product.uom} piece candle. Material ${product.material.toFixed(2)}, packing ${product.packing.toFixed(2)}.`,
    notes: [product.sku, category.name, product.uom],
    colors: getPalette(product.name),
    featured: index < 6 || product.price >= 40
  };
});

export const categories = categoryRules
  .map((rule) => ({
    id: rule.id,
    name: rule.name
  }))
  .filter((category) =>
    products.some((product) => product.category === category.name)
  );
