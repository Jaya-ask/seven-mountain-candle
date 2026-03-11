import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer" id="about">
      <div>
        <p className="eyebrow">Seven Mountains</p>
        <h3>Elegant candle collections designed for celebrations, gifting, and refined living spaces.</h3>
      </div>
      <div className="footer-columns">
        <div>
          <strong>Shop</strong>
          <a href="/">All candles</a>
          <a href="/">Gift collections</a>
          <a href="/">Festive pieces</a>
        </div>
        <div id="gifts">
          <strong>Support</strong>
          <a href="/">Custom orders</a>
          <a href="/">Bulk enquiries</a>
          <a href="/">Shipping information</a>
        </div>
      </div>
    </footer>
  );
}
