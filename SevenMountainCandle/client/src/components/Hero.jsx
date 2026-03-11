import "../styles/Hero.css";

export default function Hero({ featured, currency, inventoryCount, priceRange }) {
  const heroProduct = featured[0];

  return (
    <section className="hero-banner">
      <div className="hero-copy">
        <p className="eyebrow">Handcrafted Home Fragrance</p>
        <h2>Statement candles that feel considered, giftable, and beautifully made.</h2>
        <p>
          Explore sculpted floral candles, festive accents, pillar designs, and
          keepsake pieces curated for modern homes, celebrations, and premium gifting.
        </p>
        <div className="hero-actions">
          <a href="#collections">Shop the collection</a>
          <button type="button">Custom orders available</button>
        </div>
        <div className="hero-stats">
          <div>
            <strong>{inventoryCount || 0}+</strong>
            <span>Available designs</span>
          </div>
          <div>
            <strong>{priceRange}</strong>
            <span>Customer price range</span>
          </div>
        </div>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="candle-scene">
          <div className="glow-orb glow-orb-left" />
          <div className="glow-orb glow-orb-right" />
          <div className="candle candle-tall">
            <span className="flame" />
            <span className="jar-lid" />
          </div>
          <div className="candle candle-medium">
            <span className="flame" />
            <span className="jar-lid" />
          </div>
          <div className="candle candle-small">
            <span className="flame" />
            <span className="jar-lid" />
          </div>
          <div className="scene-base" />
        </div>
      </div>
      <div className="hero-feature-card">
        {heroProduct ? (
          <>
            <span className="feature-badge">Featured Piece</span>
            <h3>{heroProduct.name}</h3>
            <p>{heroProduct.category}</p>
            <div className="hero-meta">
              <span>{currency.format(heroProduct.price)}</span>
              <span>Ready to order</span>
            </div>
          </>
        ) : (
          <p>Loading featured collection...</p>
        )}
      </div>
    </section>
  );
}
