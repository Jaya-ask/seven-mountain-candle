import { useEffect, useState } from "react";
import Header from "./components/Header/Header.jsx";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import Footer from "./components/Footer/Footer";
import StorefrontPage from "./components/StorefrontPage/StorefrontPage";
import ShopPage from "./components/ShopPage/ShopPage";
import useCatalog from "./hooks/useCatalog";
import useCart from "./hooks/useCart";

const currency = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED"
});

export default function App() {
  const [currentPage, setCurrentPage] = useState(
    window.location.hash === "#shop" ? "shop" : "home"
  );
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  useEffect(() => {
    const syncPageWithHash = () => {
      setCurrentPage(window.location.hash === "#shop" ? "shop" : "home");
    };

    window.addEventListener("hashchange", syncPageWithHash);
    return () => window.removeEventListener("hashchange", syncPageWithHash);
  }, []);

  useEffect(() => {
    const onWindowScroll = () => {
      setShowScrollTop(window.scrollY > 220);
    };

    onWindowScroll();
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, []);

  const goToShopPage = () => {
    setCurrentPage("shop");
    if (window.location.hash !== "#shop") {
      window.location.hash = "shop";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToHomePage = () => {
    setCurrentPage("home");
    if (window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        search={search}
        onSearchChange={setSearch}
        onBrandClick={goToHomePage}
      />
      {currentPage === "home" ? (
        <StorefrontPage
          featured={featured}
          onShopNow={goToShopPage}
        />
      ) : (
        <ShopPage
          categories={catalog.categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          filteredProducts={filteredProducts}
          onAddToCart={addToCart}
          priceRange={priceRange}
          onBackToStorefront={goToHomePage}
          currency={currency}
        />
      )}
      <button
        type="button"
        className={`scroll-top-button${showScrollTop ? " visible" : ""}`}
        aria-label="Scroll to top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        ↑
      </button>
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

