import "./Highlights.scss";

const items = [
  {
    imageUrl:
      "https://res.cloudinary.com/dkhuecxa9/image/upload/v1773906777/customCandle_tfpm6y.webp",
    title: "Custom Candle Design",
    copy: "Create personalized candles tailored to your style, gifting needs, and event themes."
  },
  {
    imageUrl:
      "https://res.cloudinary.com/dkhuecxa9/image/upload/v1773906777/luxuryScent_r2swfu.webp",
    title: "Luxury Scent Collections",
    copy: "Explore curated fragrance profiles crafted to bring elegance and serenity into every space."
  },
  {
    imageUrl:
      "https://res.cloudinary.com/dkhuecxa9/image/upload/v1773906777/ecoFriendly_durk3t.webp",
    title: "Eco-Friendly Candle Options",
    copy: "Choose sustainable wax blends and materials designed for clean burns and mindful living."
  },
  {
    imageUrl:
      "https://res.cloudinary.com/dkhuecxa9/image/upload/v1773906777/worshopImage_pq52be.webp",
    title: "Candle Care Workshops",
    copy: "Join our workshops to learn how to maintain and extend the life of your candles."
  }
];

export default function Highlights() {
  return (
    <section className="highlights-strip">
      {items.map((item) => (
        <article key={item.title} className="highlight-card">
          <figure className="highlight-image-wrap">
            <img src={item.imageUrl} alt={item.title} loading="lazy" />
          </figure>
          <div className="highlight-content">
            <p className="eyebrow">{item.title}</p>
            <p>{item.copy}</p>
          </div>
        </article>
      ))}
    </section>
  );
}


