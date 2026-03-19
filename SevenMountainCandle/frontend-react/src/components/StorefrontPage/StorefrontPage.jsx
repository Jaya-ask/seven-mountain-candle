import Hero from "../Hero/Hero";
import Highlights from "../Highlights/Highlights";
import Sidebar from "../Sidebar/Sidebar";
import ProductGrid from "../ProductGrid/ProductGrid";

export default function StorefrontPage({
  featured,
  currency,
  inventoryCount,
  priceRange,
  categories,
  activeCategory,
  onSelectCategory,
  filteredProducts,
  onAddToCart
}) {
  return (
    <>
      <Hero
        featured={featured}
        currency={currency}
        inventoryCount={inventoryCount}
        priceRange={priceRange}
      />
      <Highlights />
      <main className="page-layout">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={onSelectCategory}
        />
        <section className="catalog-panel">
          <div className="catalog-toolbar">
            <div className="catalog-heading">
              <p className="eyebrow">Explore Collection</p>
              <h2>Discover exquisite candles for every setting</h2>
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
          <ProductGrid
            products={filteredProducts}
            onAddToCart={onAddToCart}
            currency={currency}
          />
        </section>
      </main>
    </>
  );
}
