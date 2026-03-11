import "../styles/Highlights.css";

const items = [
  {
    title: "Hand-poured in small batches",
    copy: "Each piece is poured with premium wax blends for a clean, even burn."
  },
  {
    title: "Gift-ready presentation",
    copy: "Elegant shapes, curated packaging, and premium finishes for meaningful gifting."
  },
  {
    title: "Secure ordering support",
    copy: "From single pieces to bulk requests, we support direct ordering and custom enquiries."
  }
];

export default function Highlights() {
  return (
    <section className="highlights-strip">
      {items.map((item) => (
        <article key={item.title} className="highlight-card">
          <p className="eyebrow">Why Customers Choose Us</p>
          <h3>{item.title}</h3>
          <p>{item.copy}</p>
        </article>
      ))}
    </section>
  );
}
