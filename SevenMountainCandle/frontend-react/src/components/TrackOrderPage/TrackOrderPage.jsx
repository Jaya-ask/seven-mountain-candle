import { useEffect, useMemo, useState } from "react";
import "./TrackOrderPage.scss";
import OrderCard from "./OrderCard";

function normalizeStatusKey(statusValue) {
  return statusValue?.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "";
}

function getEmailStatusGroup(orderStatus) {
  const statusKey = normalizeStatusKey(orderStatus);

  if (statusKey === "cancelled") {
    return "Cancelled";
  }

  if (statusKey === "delivered") {
    return "Delivered";
  }

  if (
    statusKey === "processing" ||
    statusKey === "shipped" ||
    statusKey === "out-for-delivery"
  ) {
    return "In Progress";
  }

  return "Order Placed";
}

function formatStatusLabel(status) {
  const value = status?.toString().trim() || "unknown";
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

export default function TrackOrderPage({
  currency,
  products,
  onBackToShop,
  onViewOrderDetails,
  isLoggedIn,
  authToken
}) {
  const [mode, setMode] = useState("orderNumber");
  const [queryValue, setQueryValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState(null);
  const [emailResults, setEmailResults] = useState([]);

  useEffect(() => {
    if (!isLoggedIn || !authToken) {
      return;
    }

    let isMounted = true;

    async function fetchMyOrders() {
      setLoading(true);
      setError("");
      setMode("email");
      setQueryValue("");
      setOrderResult(null);

      try {
        const response = await fetch("/api/orders/mine", {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to fetch your orders.");
        }

        if (isMounted) {
          setEmailResults(Array.isArray(payload.orders) ? payload.orders : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setEmailResults([]);
          setError(requestError?.message || "Unable to fetch your orders.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchMyOrders();

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, authToken]);

  const groupedByStatus = useMemo(() => {
    return emailResults.reduce((accumulator, order) => {
      const key = getEmailStatusGroup(order.status);
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(order);
      return accumulator;
    }, {});
  }, [emailResults]);

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = queryValue.trim();
    if (!trimmedQuery) {
      setError(mode === "email" ? "Enter an email id." : "Enter an order number.");
      return;
    }

    setLoading(true);
    setError("");
    setOrderResult(null);
    setEmailResults([]);

    try {
      const params = new URLSearchParams();
      if (mode === "email") {
        params.set("email", trimmedQuery);
      } else {
        params.set("orderNumber", trimmedQuery);
      }

      const response = await fetch(`/api/orders/track?${params.toString()}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to fetch orders.");
      }

      if (mode === "email") {
        setEmailResults(Array.isArray(payload.orders) ? payload.orders : []);
      } else {
        setOrderResult(payload.order || null);
      }
    } catch (requestError) {
      setError(requestError?.message || "Unable to fetch orders.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="track-order-page">
      <section className="track-order-panel">
        <p className="eyebrow">Track Orders</p>
        {!isLoggedIn ? <h2>Find your orders by Order Number or Email</h2> : null}

        {!isLoggedIn ? (
          <form className="track-order-form" onSubmit={handleSubmit}>
            <div className="track-order-modes" role="radiogroup" aria-label="Track order mode">
              <label>
                <input
                  type="radio"
                  name="trackMode"
                  checked={mode === "orderNumber"}
                  onChange={() => {
                    setMode("orderNumber");
                    setQueryValue("");
                    setError("");
                    setOrderResult(null);
                    setEmailResults([]);
                  }}
                />
                Order Number
              </label>
              <label>
                <input
                  type="radio"
                  name="trackMode"
                  checked={mode === "email"}
                  onChange={() => {
                    setMode("email");
                    setQueryValue("");
                    setError("");
                    setOrderResult(null);
                    setEmailResults([]);
                  }}
                />
                Email Id
              </label>
            </div>

            <label className="track-input-label">
              {mode === "email" ? "Email Id" : "Order Number"}
              <input
                type={mode === "email" ? "email" : "text"}
                value={queryValue}
                onChange={(event) => setQueryValue(event.target.value)}
                placeholder={mode === "email" ? "name@example.com" : "SMC-123456789"}
              />
            </label>

            {mode === "email" ? (
              <p className="track-note">
                Note: only orders placed through the guest journey can be viewed here.
              </p>
            ) : null}

            <div className="track-order-actions">
              <button type="button" className="secondary" onClick={onBackToShop}>Back to shop</button>
              <button type="submit" disabled={loading}>{loading ? "Searching..." : "Track order"}</button>
            </div>

            {error ? <p className="track-error">{error}</p> : null}
          </form>
        ) : null}
      </section>

      {mode === "orderNumber" && orderResult ? (
        <section className="track-results">
          <h3>Order Result</h3>
          <OrderCard
            order={orderResult}
            currency={currency}
            products={products}
            onViewDetails={onViewOrderDetails}
          />
        </section>
      ) : null}

      {isLoggedIn || mode === "email" ? (
        <section className="track-results">
          {!isLoggedIn ? <h3>Email Results</h3> : null}
          {emailResults.length === 0 && !loading && !error ? (
            <p className="track-empty">
              {isLoggedIn ? "No orders found yet." : "No orders found for this email id."}
            </p>
          ) : null}

          {Object.entries(groupedByStatus).map(([status, orders]) => (
            <div className="status-group" key={status}>
              <div className="status-group-header">
                <h4>{formatStatusLabel(status)}</h4>
                <span>{orders.length} order(s)</span>
              </div>
              <div className="status-group-grid">
                {orders.map((order) => (
                  <OrderCard
                    key={order.orderNumber}
                    order={order}
                    currency={currency}
                    products={products}
                    onViewDetails={onViewOrderDetails}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </main>
  );
}
