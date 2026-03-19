import Header from "./components/Header/Header.jsx";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import Footer from "./components/Footer/Footer";
import StorefrontPage from "./components/StorefrontPage/StorefrontPage";
import useCatalog from "./hooks/useCatalog";
import useCart from "./hooks/useCart";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

export default function App() {
  const {
    catalog,
    featured,
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    filteredProducts,
    priceRange
  } = useCatalog(currency);
  const {
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity
  } = useCart();

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        search={search}
        onSearchChange={setSearch}
        inventoryCount={catalog.products.length}
      />
      <StorefrontPage
        featured={featured}
        currency={currency}
        inventoryCount={catalog.products.length}
        priceRange={priceRange}
        categories={catalog.categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        filteredProducts={filteredProducts}
        onAddToCart={addToCart}
      />
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

