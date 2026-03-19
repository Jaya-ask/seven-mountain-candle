import { useEffect, useMemo, useState } from "react";

export default function useCatalog(currencyFormatter) {
  const [catalog, setCatalog] = useState({ categories: [], products: [] });
  const [featured, setFeatured] = useState([]);
  const [supportingData, setSupportingData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadStore() {
      const [catalogResponse, featuredResponse] = await Promise.all([
        fetch("/api/catalog"),
        fetch("/api/products/featured")
      ]);

      const catalogData = await catalogResponse.json();
      const featuredData = await featuredResponse.json();
      setCatalog(catalogData);
      setSupportingData(catalogData.supportingData);
      setFeatured(featuredData);
    }

    loadStore().catch((error) => {
      console.error("Unable to load storefront", error);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return catalog.products.filter((product) => {
      const categoryMatch =
        activeCategory === "All" || product.category === activeCategory;
      const searchMatch =
        search.trim() === "" ||
        `${product.name} ${product.description} ${product.notes.join(" ")}`
          .toLowerCase()
          .includes(search.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [activeCategory, catalog.products, search]);

  const priceRange = useMemo(() => {
    if (catalog.products.length === 0) {
      return "";
    }

    const prices = catalog.products.map((product) => product.price);
    return `${currencyFormatter.format(Math.min(...prices))} - ${currencyFormatter.format(Math.max(...prices))}`;
  }, [catalog.products, currencyFormatter]);

  return {
    catalog,
    featured,
    supportingData,
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    filteredProducts,
    priceRange
  };
}
