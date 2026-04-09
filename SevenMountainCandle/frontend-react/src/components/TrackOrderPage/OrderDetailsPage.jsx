import { useEffect, useMemo, useState } from "react";
import "./TrackOrderPage.scss";

function formatStatusLabel(status) {
  const value = status?.toString().trim() || "unknown";
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateOnly(value) {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
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

export default function OrderDetailsPage({
  orderNumber,
  currency,
  products,
  onBackToTrackOrders,
  initialOrder
}) {
  const [order, setOrder] = useState(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialOrder) {
      return;
    }

    let isCancelled = false;

    async function fetchOrder() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("orderNumber", orderNumber);

        const response = await fetch(`/api/orders/track?${params.toString()}`);
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load order details.");
        }

        if (!isCancelled) {
          setOrder(payload.order || null);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError(requestError?.message || "Unable to load order details.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrder();

    return () => {
      isCancelled = true;
    };
  }, [initialOrder, orderNumber]);

  const items = Array.isArray(order?.items) ? order.items : [];

  const invoice = useMemo(() => {
    const subtotalFromItems = Number(items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0).toFixed(2));
    const subtotal = Number.isFinite(Number(order?.subtotal)) ? Number(order.subtotal) : subtotalFromItems;
    const shipping = Number.isFinite(Number(order?.shippingCharge)) ? Number(order.shippingCharge) : 0;
    const total = Number.isFinite(Number(order?.total)) ? Number(order.total) : Number((subtotal + shipping).toFixed(2));

    return { subtotal, shipping, total };
  }, [items, order]);

  const productRows = useMemo(() => {
    return items.map((item) => ({
      ...item,
      imageUrl: getProductImage(item, products)
    }));
  }, [items, products]);

  return (
    <main className="track-order-page">
      <section className="track-order-panel track-order-details-panel">
        <div className="track-order-details-header">
          <div>
            <p className="eyebrow">Order Details</p>
            <h2>{orderNumber}</h2>
          </div>
          <button type="button" className="secondary" onClick={onBackToTrackOrders}>Back to track orders</button>
        </div>

        {loading ? <p className="track-empty">Loading order details...</p> : null}
        {error ? <p className="track-error">{error}</p> : null}

        {!loading && !error && order ? (
          <div className="track-order-details-grid">
            <section className="track-order-details-card track-order-products-card">
              <div className="track-order-section-head">
                <h3>Products</h3>
                <span className="track-order-pill">{productRows.length} item(s)</span>
              </div>
              <div className="track-order-products-list">
                {productRows.map((item) => (
                  <article className="track-order-product-row" key={`${order.orderNumber}-${item.id || item.productSku}`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} loading="lazy" />
                    ) : (
                      <div className="track-order-image-fallback" aria-hidden="true">No image</div>
                    )}
                    <div>
                      <h4>{item.productName}</h4>
                      <p>SKU: {item.productSku || "-"}</p>
                      <p>{item.quantity} x {currency.format(Number(item.unitPrice) || 0)}</p>
                    </div>
                    <strong>{currency.format(Number(item.lineTotal) || 0)}</strong>
                  </article>
                ))}
              </div>
              <div className="track-order-invoice-block">
                <h3>Invoice Summary</h3>
                <div className="track-order-invoice-row">
                  <span>Subtotal</span>
                  <strong>{currency.format(invoice.subtotal)}</strong>
                </div>
                <div className="track-order-invoice-row">
                  <span>Shipping</span>
                  <strong>{currency.format(invoice.shipping)}</strong>
                </div>
                <div className="track-order-invoice-row total">
                  <span>Total</span>
                  <strong>{currency.format(invoice.total)}</strong>
                </div>
              </div>
            </section>

            <aside className="track-order-details-side">
              <section className="track-order-details-card">
                <h3>Order Snapshot</h3>
                <div className="track-order-details-kv">
                  <span>Status</span>
                  <strong>
                    <span className={`status-badge ${order.status || "unknown"}`}>{formatStatusLabel(order.status)}</span>
                  </strong>
                </div>
                <div className="track-order-details-kv">
                  <span>Order Number</span>
                  <strong>{order.orderNumber || "-"}</strong>
                </div>
                <div className="track-order-details-kv">
                  <span>Ordered On</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>
                <div className="track-order-details-kv">
                  <span>Expected Delivery</span>
                  <strong>{formatDateOnly(order.expectedDeliveryDate)}</strong>
                </div>
                <div className="track-order-details-kv">
                  <span>Payment</span>
                  <strong>{order.paymentMethod || "-"}</strong>
                </div>
              </section>

              <section className="track-order-details-card">
                <h3>Delivery Address</h3>
                <div className="track-order-address-lines">
                  <p>{order.shipping?.address || "-"}</p>
                  <p>{order.shipping?.city || "-"}</p>
                  {order.shipping?.location ? <p>{order.shipping.location}</p> : null}
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {!loading && !error && !order ? (
          <p className="track-empty">Order details were not found.</p>
        ) : null}
      </section>
    </main>
  );
}
