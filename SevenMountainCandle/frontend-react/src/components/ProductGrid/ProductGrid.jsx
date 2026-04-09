import "./ProductGrid.scss";

function ProductCard({ product, onAddToCart, onProductSelect, currency }) {
  const imageUrl = product.imageUrl;
  const hasColorPair = Array.isArray(product.colors) && product.colors.length >= 2;
  const fallbackGradient = hasColorPair
    ? `linear-gradient(135deg, ${product.colors[0]}, ${product.colors[1]})`
    : "linear-gradient(135deg, #d8b7a0, #f3e3d6)";
  const rating = typeof product.rating === "number" ? product.rating : Number(product.rating);
  const reviewCount = Number(product.reviewCount ?? 0);
  const hasRatings = Number.isFinite(rating) && reviewCount > 0;
  const roundedRating = hasRatings ? Math.max(0, Math.min(5, Math.round(rating))) : 0;
  const starsDisplay = "★★★★★".slice(0, roundedRating) + "☆☆☆☆☆".slice(0, 5 - roundedRating);

  return (
    <article
      className="product-card"
      role="button"
      tabIndex={0}
      onClick={() => onProductSelect(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onProductSelect(product);
        }
      }}
      aria-label={`Open details for ${product.name}`}
    >
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
        {hasRatings ? (
          <div className="product-rating" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
            <span className="product-rating-stars">{starsDisplay}</span>
            <span className="product-rating-value">{rating.toFixed(1)}</span>
            <span className="product-rating-count">({reviewCount})</span>
          </div>
        ) : (
          <div className="product-rating product-rating-empty">No ratings yet</div>
        )}
        <div className="product-meta">
          {product.notes.slice(0, 3).map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
        <div className="product-footer">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAddToCart(product);
            }}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}

export default function ProductGrid({ products, onAddToCart, onProductSelect, currency }) {
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
          onProductSelect={onProductSelect}
          currency={currency}
        />
      ))}
    </div>
  );
}


