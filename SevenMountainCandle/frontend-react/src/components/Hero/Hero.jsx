import "./Hero.scss";

const referenceHeroImages = [
  "https://res.cloudinary.com/dkhuecxa9/image/upload/v1774094877/dashboard2_mzrt06.jpg",
  "https://res.cloudinary.com/dkhuecxa9/image/upload/v1774094876/dashboard1_rzxutd.jpg",
  "https://res.cloudinary.com/dkhuecxa9/image/upload/v1773832265/SMC00010_pcf4lo.png",
  "https://res.cloudinary.com/dkhuecxa9/image/upload/v1774095262/dashboard3_qrtdul.jpg"
];

export default function Hero({ featured, onShopNow }) {
  return (
    <section className="hero-banner">
      <div className="hero-side hero-side-left">
        <figure className="hero-photo hero-photo-primary">
          <img src={referenceHeroImages[0]} alt="Premium candle arrangement" loading="eager" />
        </figure>
        <figure className="hero-photo hero-photo-secondary">
          <img src={referenceHeroImages[1]} alt="Elegant candle styling" loading="lazy" />
        </figure>
      </div>
      <div className="hero-copy">
        <p className="eyebrow">Elevate Spaces with Seven Mountains Candles</p>
        <h2>Illuminate Your Space with Elegance</h2>
        <p>
          Explore exquisite candle collections at Seven Mountains, where artistry
          meets ambiance. From modern to traditional styles, each piece is
          crafted to enrich your surroundings and elevate your moments.
        </p>
        <div className="hero-actions">
          <button
            type="button"
            className="hero-shop-cta"
            onClick={() => {
              onShopNow?.();
            }}
          >
            Shop Candles Now
          </button>
          <button type="button">Get in touch</button>
        </div>
      </div>
      <div className="hero-side hero-side-right">
        <figure className="hero-photo hero-photo-tertiary">
          <img src={referenceHeroImages[2]} alt="Decorative candle display" loading="lazy" />
        </figure>
        <figure className="hero-photo hero-photo-quaternary">
          <img src={referenceHeroImages[3]} alt="Stylish candle arrangement" loading="lazy" />
        </figure>
      </div>
    </section>
  );
}


