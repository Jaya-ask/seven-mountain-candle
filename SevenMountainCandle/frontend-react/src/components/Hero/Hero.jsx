import "./Hero.scss";

const referenceHeroImages = [
  "https://cdn.durable.co/getty/18zjRXlwr1yVO35CLKMJ6sJC4kopDyXXJzAw7huajsCO8wNRyPOVo0637e4JbFQq.jpeg",
  "https://cdn.durable.co/getty/21jR14b6gfCEsfu8I7Jr8bF2qXJMQ6uyo8eUxQrdTtiOUmI6arXoJqswJYAYrJB8.jpeg"
];

export default function Hero({ featured, currency, inventoryCount, priceRange }) {
  const heroProduct = featured[0];
  const heroImagePrimary =
    featured[0]?.imageUrl || featured[0]?.imageutl || referenceHeroImages[0];
  const heroImageSecondary =
    featured[1]?.imageUrl || featured[1]?.imageutl || referenceHeroImages[1];

  return (
    <section className="hero-banner">
      <div className="hero-copy">
        <p className="eyebrow">Elevate Spaces with Seven Mountains Candles</p>
        <h2>Illuminate Your Space with Elegance</h2>
        <p>
          Explore exquisite candle collections at Seven Mountains, where artistry
          meets ambiance. From modern to traditional styles, each piece is
          crafted to enrich your surroundings and elevate your moments.
        </p>
        <div className="hero-actions">
          <a href="#collections">Shop Candles Now</a>
          <button type="button">Get in touch</button>
        </div>
      </div>
      <div className="hero-art">
        <div className="hero-photo-stack">
          <figure className="hero-photo hero-photo-primary">
            <img src={heroImagePrimary} alt="Premium candle arrangement" loading="eager" />
          </figure>
          <figure className="hero-photo hero-photo-secondary">
            <img src={heroImageSecondary} alt="Elegant candle styling" loading="lazy" />
          </figure>
        </div>
      </div>
      <div className="hero-feature-card">
        {heroProduct ? (
          <>
            <span className="feature-badge">Custom Candle Creations</span>
            <h3>{heroProduct.name}</h3>
            <p>{heroProduct.category}</p>
            <div className="hero-meta">
              <span>{currency.format(heroProduct.price)}</span>
              <span>UAE delivery available</span>
            </div>
          </>
        ) : (
          <p>Loading featured collection...</p>
        )}
      </div>
    </section>
  );
}


