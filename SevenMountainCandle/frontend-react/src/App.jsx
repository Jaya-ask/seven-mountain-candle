import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import DataTables from "./components/DataTables";
import Highlights from "./components/Highlights";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default function App() {
  const [catalog, setCatalog] = useState({ categories: [], products: [] });
  const [featured, setFeatured] = useState([]);
  const [supportingData, setSupportingData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const priceRange = useMemo(() => {
    if (catalog.products.length === 0) {
      return "";
    }

    const prices = catalog.products.map((product) => product.price);
    return `${currency.format(Math.min(...prices))} - ${currency.format(Math.max(...prices))}`;
  }, [catalog.products]);

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function updateQuantity(productId, nextQuantity) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: nextQuantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        search={search}
        onSearchChange={setSearch}
        inventoryCount={catalog.products.length}
      />
      <Hero
        featured={featured}
        currency={currency}
        inventoryCount={catalog.products.length}
        priceRange={priceRange}
      />
      <Highlights />
      <main className="page-layout">
        <Sidebar
          categories={catalog.categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />
        <section className="catalog-panel">
          <div className="catalog-toolbar">
            <div className="catalog-heading">
              <p className="eyebrow">Shop the Collection</p>
              <h2>Excel-priced candle catalogue for your live inventory</h2>
              <p className="catalog-copy">
                Search by SKU, browse by use case, and add products into a live
                cart before moving to checkout or manual order capture.
              </p>
            </div>
            <div className="catalog-summary-wrap">
              <div className="catalog-summary">
                <strong>{filteredProducts.length}</strong>
                <span>Visible items</span>
              </div>
              <div className="catalog-summary secondary">
                <strong>{priceRange || "-"}</strong>
                <span>Store range</span>
              </div>
            </div>
          </div>
          <ProductGrid
            products={filteredProducts}
            onAddToCart={addToCart}
            currency={currency}
          />
        </section>
      </main>
      <section className="operations-section" id="catalog-data">
        <div className="operations-header">
          <div>
            <p className="eyebrow">Additional Catalogue Data</p>
            <h2>Detailed catalogue, materials, and production references</h2>
          </div>
          <p className="operations-copy">
            This section keeps the original workbook data available for catalog
            management and detailed reference, while the main storefront stays
            focused on shopping.
          </p>
        </div>
        <DataTables supportingData={supportingData} />
      </section>
      <CartDrawer
        open={cartOpen}
        cart={cart}
        subtotal={currency.format(subtotal)}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        currency={currency}
      />
      <Footer />
    </div>
  );
}
