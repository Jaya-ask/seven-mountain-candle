import "./Sidebar.scss";

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
        <p className="eyebrow">Get in touch</p>
        <div className="sidebar-note">
          <strong>Custom Candle Creations for Every Taste</strong>
          <p>
            From personalized candle design to bulk event orders, we help you
            curate collections that elevate every moment.
          </p>
        </div>
      </div>
    </aside>
  );
}


