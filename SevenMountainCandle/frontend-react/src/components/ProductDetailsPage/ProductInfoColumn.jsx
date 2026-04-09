export default function ProductInfoColumn({
  product,
  notes,
  averageRating,
  reviewsCount,
  currency,
  renderStars
}) {
  return (
    <section className="product-details-info-column" aria-label="Product details">
      <h1>{product.name}</h1>

      <div className="product-details-rating-row">
        <span className="product-details-rating-value">{averageRating.toFixed(1)}</span>
        <span className="product-details-stars" aria-label={`Rated ${averageRating.toFixed(1)} out of 5`}>
          {renderStars(averageRating)}
        </span>
        <span className="product-details-rating-count">{reviewsCount} ratings</span>
      </div>

      <hr className="product-details-divider" />

      <p className="product-details-price-line">
        <span>Price:</span>
        <strong>{currency.format(product.price)}</strong>
      </p>

      <p className="product-details-description">{product.description}</p>

      <ul className="product-details-bullets">
        <li>Category: {product.category}</li>
        <li>Unit: {product.uom}</li>
        <li>Material cost: {currency.format(Number(product.material) || 0)}</li>
        <li>Packing cost: {currency.format(Number(product.packing) || 0)}</li>
        <li>Hand-finished artisan candle</li>
      </ul>

      {notes.length > 0 ? (
        <div className="product-details-notes">
          {notes.map((note) => (
            <span key={note}>{note}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
