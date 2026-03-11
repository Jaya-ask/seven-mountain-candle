import "../styles/ProductGrid.css";

function ProductCard({ product, onAddToCart, currency }) {
  return (
    <article className="product-card">
      <div
        className="product-image"
        style={{
          backgroundImage: `linear-gradient(135deg, ${product.colors[0]}, ${product.colors[1]})`
        }}
      >
        <span>{product.category}</span>
      </div>
      <div className="product-body">
        <p className="product-sku">{product.sku}</p>
        <div className="product-heading">
          <h3>{product.name}</h3>
          <strong>{currency.format(product.price)}</strong>
        </div>
        <p>{product.category} candle crafted as a decorative and gift-ready piece.</p>
        <div className="product-notes">
          {product.notes.slice(0, 2).map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
        <div className="product-meta">
          <span>Hand-finished</span>
          <span>{product.uom}</span>
        </div>
        <div className="product-footer">
          <small>SKU {product.sku}</small>
          <button type="button" onClick={() => onAddToCart(product)}>
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductGrid({ products, onAddToCart, currency }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <h3>No products matched your search.</h3>
        <p>Try another keyword or browse all collections.</p>
      </div>
    );
  }

  return (
    <div className="product-grid" id="best-sellers">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          currency={currency}
        />
      ))}
    </div>
  );
}
