import "./Footer.scss";

export default function Footer() {
  return (
    <footer className="site-footer" id="about">
      <div>
        <p className="eyebrow">Seven Mountains</p>
        <h3>Illuminate Your Space Elegantly</h3>
        <p className="footer-address">
          Ajman Boulevard-A Building, Ajman Free Zone, United Arab Emirates
        </p>
      </div>
      <div className="footer-columns">
        <div>
          <strong>Explore</strong>
          <a href="#collections">Explore Collection</a>
          <a href="#collections">Custom Candle Design</a>
          <a href="#collections">Luxury Scent Collections</a>
        </div>
        <div id="gifts">
          <strong>Get in touch</strong>
          <a href="https://api.whatsapp.com/send?phone=971557578038&text=May%20i%20get%20more%20details%20on%20this!!">WhatsApp us</a>
          <a href="#about">Send us a message</a>
          <a href="#collections">Bulk and custom orders</a>
        </div>
      </div>
    </footer>
  );
}


