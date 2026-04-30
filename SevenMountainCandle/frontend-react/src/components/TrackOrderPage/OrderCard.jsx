function formatStatusLabel(status) {
  const value = status?.toString().trim() || "unknown";
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

function getProductImage(item, products) {
  if (!Array.isArray(products) || products.length === 0) {
    return "";
  }

  const skuKey = item.productSku?.toString().trim().toLowerCase();
  const nameKey = item.productName?.toString().trim().toLowerCase();

  const matched = products.find((product) => {
    const productSku = product.sku?.toString().trim().toLowerCase();
    const productName = product.name?.toString().trim().toLowerCase();

    return (skuKey && productSku === skuKey) || (nameKey && productName === nameKey);
  });

  return matched?.imageUrl || matched?.primaryImageUrl || matched?.galleryImages?.[0] || "";
}

export default function OrderCard({ order, currency, products, onViewDetails }) {
  const itemCount = Number.isFinite(Number(order.itemCount))
    ? Number(order.itemCount)
    : Array.isArray(order.items)
      ? order.items.reduce((count, item) => count + (Number(item.quantity) || 0), 0)
      : 0;
  const items = Array.isArray(order.items) ? order.items : [];
  const previewItems = items.slice(0, 1);
  const remainingItemCount = Math.max(items.length - previewItems.length, 0);
  const fallbackTotal = Array.isArray(order.items)
    ? order.items.reduce((total, item) => total + (Number(item.lineTotal) || 0), 0)
    : 0;
  const totalValue = Number.isFinite(Number(order.total)) ? Number(order.total) : fallbackTotal;

  return (
    <article className="track-order-card">
      <header>
        <h4>{order.orderNumber}</h4>
        <span className={`status-badge ${order.status || "unknown"}`}>{formatStatusLabel(order.status)}</span>
      </header>

      <div className="track-order-items">
        <div className="track-order-summary-footer">
          <p><strong>No. of items:</strong> {itemCount}</p>
          <p><strong>Total:</strong> {currency.format(totalValue)}</p>
        </div>

        {order.summaryOnly ? (
          <p className="empty-items">Item and delivery details are hidden for email search.</p>
        ) : previewItems.length > 0 ? (
          <div className="track-order-preview-list">
            {previewItems.map((item) => {
              const itemImage = getProductImage(item, products);
              return (
                <article className="track-order-preview-item" key={`${order.orderNumber}-${item.id || item.productSku}`}>
                  {itemImage ? (
                    <img src={itemImage} alt={item.productName} loading="lazy" />
                  ) : (
                    <div className="track-order-preview-fallback" aria-hidden="true">No image</div>
                  )}
                  <div>
                    <p>{item.productName}</p>
                    <small>{item.quantity} x {currency.format(Number(item.unitPrice) || 0)}</small>
                  </div>
                  <strong>{currency.format(Number(item.lineTotal) || 0)}</strong>
                </article>
              );
            })}
            {remainingItemCount > 0 ? (
              <button
                type="button"
                className="track-order-preview-more-link"
                onClick={() => onViewDetails?.(order)}
              >
                + {remainingItemCount} item(s)
              </button>
            ) : null}
          </div>
        ) : (
          <p className="empty-items">No items found for this order.</p>
        )}
      </div>

      <div className="track-order-card-actions">
        <button
          type="button"
          className="track-order-view-details-btn"
          onClick={() => onViewDetails?.(order)}
        >
          View details
        </button>
      </div>
    </article>
  );
}
