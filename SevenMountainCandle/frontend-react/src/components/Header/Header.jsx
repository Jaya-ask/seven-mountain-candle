import "./Header.scss";

export default function Header({
  cartCount,
  onCartOpen,
  search,
  onSearchChange,
  onBrandClick
}) {
  return (
    <header className="site-header">
      <div className="header-main">
        <button type="button" className="brand-block" onClick={onBrandClick}>
          <h1>Seven Mountains</h1>
          <p className="eyebrow">Candle Studio</p>
        </button>
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
    </header>
  );
}


