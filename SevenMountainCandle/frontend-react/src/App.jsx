import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import AuthPage from "./components/AuthPage/AuthPage";
import CartDrawer from "./components/CartDrawer/CartDrawer";
import Footer from "./components/Footer/Footer";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import StorefrontPage from "./components/StorefrontPage/StorefrontPage";
import ShopPage from "./components/ShopPage/ShopPage";
import CheckoutPage from "./components/CheckoutPage/CheckoutPage";
import ProductDetailsPage from "./components/ProductDetailsPage/ProductDetailsPage";
import TrackOrderPage from "./components/TrackOrderPage/TrackOrderPage";
import OrderDetailsPage from "./components/TrackOrderPage/OrderDetailsPage";
import AdminPage from "./components/AdminPage/AdminPage";
import ManageProductsPage from "./components/ManageProductsPage/ManageProductsPage";
import useCatalog from "./hooks/useCatalog";
import useCart from "./hooks/useCart";

const currency = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED"
});

function ProductDetailsRoute({
  products,
  onBackToShop,
  onAddToCart,
  onBuyNow,
  onReviewSubmitted
}) {
  const { productId } = useParams();

  const product = useMemo(() => {
    if (!productId) {
      return null;
    }

    const decodedProductId = decodeURIComponent(productId);
    return products.find(
      (entry) =>
        entry.id === decodedProductId ||
        entry.sku?.toLowerCase() === decodedProductId.toLowerCase()
    ) || null;
  }, [productId, products]);

  return (
    <ProductDetailsPage
      product={product}
      currency={currency}
      onBackToShop={onBackToShop}
      onAddToCart={onAddToCart}
      onBuyNow={onBuyNow}
      onReviewSubmitted={onReviewSubmitted}
    />
  );
}

function TrackOrderDetailsRoute({
  products,
  onBackToTrackOrders
}) {
  const { orderNumber } = useParams();
  const location = useLocation();

  return (
    <OrderDetailsPage
      orderNumber={decodeURIComponent(orderNumber || "")}
      currency={currency}
      products={products}
      onBackToTrackOrders={onBackToTrackOrders}
      initialOrder={location.state?.order || null}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [authState, setAuthState] = useState(() => {
    const token = window.localStorage.getItem("authToken") || "";
    const rawUser = window.localStorage.getItem("authUser");

    let user = null;
    if (rawUser) {
      try {
        user = JSON.parse(rawUser);
      } catch {
        user = null;
      }
    }

    return { token, user };
  });
  const {
    catalog,
    featured,
    activeCategory,
    setActiveCategory,
    search,
    setSearch,
    refreshCatalog,
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
    updateQuantity,
    clearCart
  } = useCart();

  const isLoggedIn = Boolean(authState.token);
  const isAdmin = authState.user?.role === "admin";

  const currentPage =
    location.pathname === "/checkout"
      ? "checkout"
      : location.pathname === "/auth"
        ? "auth"
        : location.pathname === "/profile"
          ? "profile"
      : location.pathname === "/admin/products"
        ? "admin-products"
      : location.pathname === "/admin"
        ? "admin"
      : location.pathname === "/track-order" || location.pathname.startsWith("/track-order/")
        ? "track-order"
      : location.pathname === "/shop"
        ? "shop"
        : location.pathname.startsWith("/product/")
          ? "product-details"
          : "home";

  useEffect(() => {
    const onWindowScroll = () => {
      setShowScrollTop(window.scrollY > 220);
    };

    onWindowScroll();
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", onWindowScroll);
  }, []);

  useEffect(() => {
    if (authState.token) {
      window.localStorage.setItem("authToken", authState.token);
    } else {
      window.localStorage.removeItem("authToken");
    }

    if (authState.user) {
      window.localStorage.setItem("authUser", JSON.stringify(authState.user));
    } else {
      window.localStorage.removeItem("authUser");
    }
  }, [authState]);

  const goToShopPage = () => {
    navigate("/shop");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToCheckoutPage = () => {
    setCartOpen(false);

    navigate("/checkout");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToHomePage = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToTrackOrderPage = () => {
    navigate("/track-order");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToAdminPage = () => {
    navigate("/admin");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToManageProductsPage = () => {
    navigate("/admin/products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToProfilePage = () => {
    if (!isLoggedIn) {
      navigate("/auth");
    } else if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/profile");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginSuccess = ({ token, user }) => {
    setAuthState({ token, user: user || null });
  };

  const handleAuthUserUpdate = useCallback((nextUser) => {
    setAuthState((current) => ({
      ...current,
      user: nextUser || current.user
    }));
  }, []);

  const handleLogout = () => {
    setAuthState({ token: "", user: null });
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToOrderDetailsPage = (order) => {
    const encodedOrderNumber = encodeURIComponent(order.orderNumber);
    navigate(`/track-order/${encodedOrderNumber}`, {
      state: { order }
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToProductDetailsPage = (product) => {
    const encodedProductId = encodeURIComponent(product.id);
    navigate(`/product/${encodedProductId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buyNow = (product) => {
    addToCart(product);
    goToCheckoutPage();
  };

  const placeOrder = async (payload) => {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responsePayload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(responsePayload?.message || "Failed to place order.");
    }

    setCartOpen(false);
    return responsePayload;
  };

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        search={search}
        onSearchChange={setSearch}
        onBrandClick={goToHomePage}
        onTrackOrderClick={goToTrackOrderPage}
        onManageOrdersClick={goToAdminPage}
        onManageProductsClick={goToManageProductsPage}
        onAuthClick={goToProfilePage}
        onLogoutClick={handleLogout}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        userName={authState.user?.name || ""}
        page={currentPage}
      />
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={(
              <StorefrontPage
                featured={featured}
                onShopNow={goToShopPage}
              />
            )}
          />
          <Route
            path="/shop"
            element={(
              <ShopPage
                categories={catalog.categories}
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
                filteredProducts={filteredProducts}
                onAddToCart={addToCart}
                onProductSelect={goToProductDetailsPage}
                priceRange={priceRange}
                currency={currency}
              />
            )}
          />
          <Route
            path="/product/:productId"
            element={(
              <ProductDetailsRoute
                products={catalog.products}
                onBackToShop={goToShopPage}
                onAddToCart={addToCart}
                onBuyNow={buyNow}
                onReviewSubmitted={refreshCatalog}
              />
            )}
          />
          <Route
            path="/track-order"
            element={(
              <TrackOrderPage
                currency={currency}
                products={catalog.products}
                onBackToShop={goToShopPage}
                onViewOrderDetails={goToOrderDetailsPage}
                isLoggedIn={isLoggedIn}
                authToken={authState.token}
              />
            )}
          />
          <Route
            path="/track-order/:orderNumber"
            element={(
              <TrackOrderDetailsRoute
                products={catalog.products}
                onBackToTrackOrders={goToTrackOrderPage}
              />
            )}
          />
          <Route
            path="/admin"
            element={
              !isLoggedIn
                ? <Navigate to="/auth?redirect=%2Fadmin" replace />
                : isAdmin
                  ? (
                    <AdminPage
                      authToken={authState.token}
                      currency={currency}
                      onViewOrderDetails={goToOrderDetailsPage}
                    />
                  )
                  : <Navigate to="/" replace />
            }
          />
          <Route
            path="/admin/products"
            element={
              !isLoggedIn
                ? <Navigate to="/auth?redirect=%2Fadmin%2Fproducts" replace />
                : isAdmin
                  ? <ManageProductsPage authToken={authState.token} onCatalogRefresh={refreshCatalog} />
                  : <Navigate to="/" replace />
            }
          />
          <Route
            path="/auth"
            element={
              isLoggedIn
                ? <Navigate to="/" replace />
                : <AuthPage onLoginSuccess={handleLoginSuccess} />
            }
          />
          <Route
            path="/profile"
            element={
              isLoggedIn
                ? <ProfilePage user={authState.user} onLogout={handleLogout} />
                : <Navigate to="/auth?redirect=%2Fprofile" replace />
            }
          />
          <Route
            path="/checkout"
            element={(
              <CheckoutPage
                cart={cart}
                subtotal={subtotal}
                currency={currency}
                authToken={authState.token}
                authUser={authState.user}
                onAuthUserUpdate={handleAuthUserUpdate}
                onBackToShop={goToShopPage}
                onPlaceOrder={placeOrder}
                onContinueAfterOrder={() => {
                  clearCart();
                  goToShopPage();
                }}
              />
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <button
          type="button"
          className={`scroll-top-button${showScrollTop ? " visible" : ""}`}
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      </main>
      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onProceedToCheckout={goToCheckoutPage}
        onShopNow={goToShopPage}
        currency={currency}
      />
      <Footer />
    </div>
  );
}

