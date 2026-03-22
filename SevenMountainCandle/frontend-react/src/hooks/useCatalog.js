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
      const normalizedSearch = search.trim().toLowerCase();
      const isSearching = normalizedSearch !== "";
      const categoryMatch =
        isSearching || activeCategory === "All" || product.category === activeCategory;
      const notesText = Array.isArray(product.notes) ? product.notes.join(" ") : "";
      const searchableText = [
        product.name,
        product.category,
        product.description,
        notesText,
        product.id,
        product.sku,
        product.productNumber,
        product.number,
        product.code
      ]
        .filter((value) => value !== undefined && value !== null)
        .join(" ")
        .toLowerCase();

      const searchMatch =
        normalizedSearch === "" || searchableText.includes(normalizedSearch);

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
