import Sidebar from "../Sidebar/Sidebar";
import ProductGrid from "../ProductGrid/ProductGrid";

export default function ShopPage({
  categories,
  activeCategory,
  onSelectCategory,
  filteredProducts,
  onAddToCart,
  priceRange,
  onBackToStorefront,
  currency
}) {
  return (
    <main className="page-layout" id="shop">
      <Sidebar
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
      />
      <section className="catalog-panel">
        <div className="catalog-toolbar">
          <div className="catalog-heading">
            <p className="eyebrow">Explore Collection</p>
            <h2 className="shop-heading-single-line">Discover exquisite candles for every setting</h2>
            <p className="catalog-copy">
              Discover our exquisite collection of candles designed to enhance
              any setting in style. From traditional to modern, find the
              perfect piece for homes, celebrations, and gifting.
            </p>
          </div>
          <div className="catalog-summary-wrap">
            <div className="catalog-summary">
              <strong>{filteredProducts.length}</strong>
              <span>Products shown</span>
            </div>
            <div className="catalog-summary secondary">
              <strong>{priceRange || "-"}</strong>
              <span>Price range</span>
            </div>
          </div>
        </div>

        <div className="catalog-back-action">
          <button type="button" onClick={onBackToStorefront}>
            Back to storefront
          </button>
        </div>

        <ProductGrid
          products={filteredProducts}
          onAddToCart={onAddToCart}
          currency={currency}
        />
      </section>
    </main>
  );
}
