import "../styles/Sidebar.css";

const quickLinks = [
  "Wedding Favours",
  "Birthday Gifts",
  "Festive Decor",
  "Spiritual Collection",
  "Luxury Centerpieces",
  "Bulk Orders"
];

export default function Sidebar({
  categories,
  activeCategory,
  onSelectCategory
}) {
  return (
    <aside className="catalog-sidebar" id="collections">
      <div className="sidebar-card">
        <p className="eyebrow">Browse</p>
        <h3>Shop by Collection</h3>
        <button
          type="button"
          className={activeCategory === "All" ? "active" : ""}
          onClick={() => onSelectCategory("All")}
        >
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={activeCategory === category.name ? "active" : ""}
            onClick={() => onSelectCategory(category.name)}
          >
            {category.name}
          </button>
        ))}
      </div>
      <div className="sidebar-card">
        <p className="eyebrow">Need Help?</p>
        <div className="sidebar-note">
          <strong>Curated for gifting and events</strong>
          <p>
            Choose by occasion or contact us for custom orders, event quantities,
            and premium packaging support.
          </p>
        </div>
      </div>
      <div className="sidebar-card">
        <p className="eyebrow">Shop by Occasion</p>
        <div className="quick-links">
          {quickLinks.map((item) => (
            <a key={item} href="#collections">
              {item}
            </a>
          ))}
        </div>
      </div>
    </aside>
  );
}
