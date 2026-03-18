import "../styles/Header.css";

export default function Header({
  cartCount,
  onCartOpen,
  search,
  onSearchChange,
  inventoryCount
}) {
  return (
    <header className="site-header">
      <div className="top-strip">
        <span>Handcrafted decorative candles for gifting and home styling</span>
        <span>{inventoryCount || 0}+ designs available for order</span>
      </div>
      <div className="header-main">
        <div className="brand-block">
          <p className="eyebrow">Seven Mountains</p>
          <h1>Candle Studio</h1>
        </div>
        <div className="header-search">
          <input
            type="search"
            placeholder="Search florals, festive candles, pillars, gifts"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div className="header-actions">
          <button type="button">Support</button>
          <button type="button" onClick={onCartOpen}>
            Cart ({cartCount})
          </button>
        </div>
      </div>
      <nav className="header-nav">
        <a href="#collections">Shop</a>
        <a href="#best-sellers">Best Sellers</a>
        <a href="#gifts">Gift Ideas</a>
        <a href="#about">Our Story</a>
        <a href="#catalog-data">Catalogue Data</a>
      </nav>
    </header>
  );
}
