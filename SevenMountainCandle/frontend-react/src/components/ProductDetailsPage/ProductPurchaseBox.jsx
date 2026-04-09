export default function ProductPurchaseBox({
  product,
  currency,
  onAddToCart,
  onBuyNow,
  showReviewForm,
  onToggleReviewForm
}) {
  return (
    <aside className="product-details-buy-box" aria-label="Purchase options">
      <p className="product-details-buy-price">{currency.format(product.price)}</p>
      <p className="product-details-delivery">Artisan quality in every candle.</p>
      <ul className="product-details-delivery-points" aria-label="Delivery details">
        <li>Hand-finished in small batches.</li>
        <li>Thoughtfully packed with premium materials.</li>
        <li>Crafted to complement your home ambiance.</li>
      </ul>

      <button type="button" className="product-details-cart-button" onClick={() => onAddToCart(product)}>
        Add to cart
      </button>

      <button
        type="button"
        className="product-details-buy-now-button"
        onClick={() => {
          if (typeof onBuyNow === "function") {
            onBuyNow(product);
            return;
          }

          onAddToCart(product);
        }}
      >
        Buy now
      </button>

      <button
        type="button"
        className="product-details-review-button"
        onClick={onToggleReviewForm}
      >
        {showReviewForm ? "Cancel review" : "Write a review"}
      </button>
    </aside>
  );
}
