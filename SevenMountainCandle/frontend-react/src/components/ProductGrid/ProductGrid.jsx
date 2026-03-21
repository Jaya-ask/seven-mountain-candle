import "./ProductGrid.scss";

function ProductCard({ product, onAddToCart, currency }) {
  const imageUrl = product.imageUrl;
  const hasColorPair = Array.isArray(product.colors) && product.colors.length >= 2;
  const fallbackGradient = hasColorPair
    ? `linear-gradient(135deg, ${product.colors[0]}, ${product.colors[1]})`
    : "linear-gradient(135deg, #d8b7a0, #f3e3d6)";

  return (
    <article className="product-card">
      <div
        className="product-image"
        style={{
          backgroundImage: fallbackGradient
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={product.name} loading="lazy" />
        ) : null}
        <span>{product.category}</span>
      </div>
      <div className="product-body">
        <div className="product-heading">
          <h3>{product.name}</h3>
          <strong>{currency.format(product.price)}</strong>
        </div>
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


