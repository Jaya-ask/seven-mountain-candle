import { useEffect, useMemo, useRef, useState } from "react";
import FilterListIcon from "@mui/icons-material/FilterList";
import "./AdminPage.scss";

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString();
}

function getTimeValue(dateValue) {
  if (!dateValue) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return parsed.getTime();
}

function toDateInputValue(dateValue) {
  if (!dateValue) {
    return "";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
}

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function resolveRegionLabel(order) {
  return order?.shipping?.city || order?.shipping?.location || "Unknown";
}

function getDateOnlyKey(dateValue) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getOrderItemCount(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  return items.reduce((total, item) => total + Number(item?.quantity || 0), 0);
}

export default function AdminPage({ authToken, currency }) {
  const minExpectedDeliveryDate = getTodayDateInputValue();
  const detailsSectionRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("order-date-newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderIdSearch, setOrderIdSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [statusDraftByOrder, setStatusDraftByOrder] = useState({});
  const [statusUpdateState, setStatusUpdateState] = useState({});
  const [deliveryDateDraftByOrder, setDeliveryDateDraftByOrder] = useState({});
  const [deliveryDateUpdateState, setDeliveryDateUpdateState] = useState({});
  const [productImageBySku, setProductImageBySku] = useState({});
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const todayKey = useMemo(() => getDateOnlyKey(new Date().toISOString()), []);
  const yesterdayKey = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return getDateOnlyKey(date.toISOString());
  }, []);
  const last7StartKey = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return getDateOnlyKey(date.toISOString());
  }, []);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let isMounted = true;

    async function fetchOrders() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/admin/orders", {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load admin orders.");
        }

        if (isMounted) {
          setOrders(Array.isArray(payload.orders) ? payload.orders : []);
          setAvailableStatuses(Array.isArray(payload.availableStatuses) ? payload.availableStatuses : []);
        }
      } catch (requestError) {
        if (isMounted) {
          setOrders([]);
          setAvailableStatuses([]);
          setError(requestError?.message || "Unable to load admin orders.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [authToken]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProductsForImages() {
      try {
        const response = await fetch("/api/catalog");
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          return;
        }

        const products = Array.isArray(payload?.products) ? payload.products : [];
        const imageMap = {};

        for (const product of products) {
          const sku = product?.sku?.toString().trim();
          const imageUrl = product?.imageUrl?.toString().trim();

          if (sku && imageUrl) {
            imageMap[sku] = imageUrl;
          }
        }

        if (isMounted) {
          setProductImageBySku(imageMap);
        }
      } catch {
        if (isMounted) {
          setProductImageBySku({});
        }
      }
    }

    fetchProductsForImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const regions = useMemo(() => {
    const values = new Set();

    for (const order of orders) {
      values.add(resolveRegionLabel(order));
    }

    return Array.from(values).sort((left, right) => left.localeCompare(right));
  }, [orders]);

  const filteredAndSortedOrders = useMemo(() => {
    const filtered = orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || (order.status || "") === statusFilter;
      const matchesRegion = regionFilter === "all" || resolveRegionLabel(order) === regionFilter;
      const normalizedOrderNumber = order.orderNumber?.toString().toLowerCase() || "";
      const matchesOrderId = !orderIdSearch.trim()
        || normalizedOrderNumber.includes(orderIdSearch.trim().toLowerCase());
      const normalizedCustomerName = order.customer?.name?.toString().toLowerCase() || "";
      const normalizedCustomerEmail = order.customer?.email?.toString().toLowerCase() || "";
      const normalizedCustomerSearch = customerSearch.trim().toLowerCase();
      const matchesCustomer = !normalizedCustomerSearch
        || normalizedCustomerName.includes(normalizedCustomerSearch)
        || normalizedCustomerEmail.includes(normalizedCustomerSearch);
      const createdDateKey = getDateOnlyKey(order.createdAt);

      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate = createdDateKey === todayKey;
      } else if (dateFilter === "yesterday") {
        matchesDate = createdDateKey === yesterdayKey;
      } else if (dateFilter === "last7") {
        matchesDate = Boolean(createdDateKey) && createdDateKey >= last7StartKey && createdDateKey <= todayKey;
      } else if (dateFilter === "custom") {
        const from = customDateFrom || "0000-01-01";
        const to = customDateTo || "9999-12-31";
        matchesDate = Boolean(createdDateKey) && createdDateKey >= from && createdDateKey <= to;
      }

      return matchesStatus && matchesRegion && matchesOrderId && matchesCustomer && matchesDate;
    });

    filtered.sort((left, right) => {
      if (sortBy === "expected-delivery-nearest") {
        return getTimeValue(left.expectedDeliveryDate) - getTimeValue(right.expectedDeliveryDate);
      }

      if (sortBy === "order-date-newest") {
        return getTimeValue(right.createdAt) - getTimeValue(left.createdAt);
      }

      if (sortBy === "order-date-oldest") {
        return getTimeValue(left.createdAt) - getTimeValue(right.createdAt);
      }

      if (sortBy === "amount-high") {
        return Number(right.total || 0) - Number(left.total || 0);
      }

      if (sortBy === "amount-low") {
        return Number(left.total || 0) - Number(right.total || 0);
      }

      return 0;
    });

    return filtered;
  }, [
    customDateFrom,
    customDateTo,
    customerSearch,
    dateFilter,
    last7StartKey,
    orderIdSearch,
    orders,
    regionFilter,
    sortBy,
    statusFilter,
    todayKey,
    yesterdayKey
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedOrders = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedOrders.slice(start, start + pageSize);
  }, [filteredAndSortedOrders, pageSize, safeCurrentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, regionFilter, sortBy, orderIdSearch, customerSearch, dateFilter, customDateFrom, customDateTo]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleClearAllFilters() {
    setStatusFilter("all");
    setRegionFilter("all");
    setSortBy("order-date-newest");
    setOrderIdSearch("");
    setCustomerSearch("");
    setDateFilter("all");
    setCustomDateFrom("");
    setCustomDateTo("");
    setCurrentPage(1);
  }

  function getDraftStatus(order) {
    return statusDraftByOrder[order.orderNumber] || order.status || "";
  }

  function getDraftExpectedDeliveryDate(order) {
    return deliveryDateDraftByOrder[order.orderNumber] || toDateInputValue(order.expectedDeliveryDate);
  }

  function handleDraftStatusChange(orderNumber, value) {
    setStatusDraftByOrder((current) => ({
      ...current,
      [orderNumber]: value
    }));
  }

  function handleDraftExpectedDeliveryDateChange(orderNumber, value) {
    setDeliveryDateDraftByOrder((current) => ({
      ...current,
      [orderNumber]: value
    }));
  }

  async function handleStatusUpdate(order) {
    const orderNumber = order.orderNumber;
    const nextStatus = getDraftStatus(order);

    if (!nextStatus || nextStatus === order.status) {
      return;
    }

    setStatusUpdateState((current) => ({
      ...current,
      [orderNumber]: "saving"
    }));

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: nextStatus })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update order status.");
      }

      const updatedOrder = payload?.order || null;

      setOrders((current) => current.map((entry) => (
        entry.orderNumber === orderNumber
          ? { ...entry, ...(updatedOrder || {}), status: updatedOrder?.status || nextStatus }
          : entry
      )));

      setStatusUpdateState((current) => ({
        ...current,
        [orderNumber]: "saved"
      }));
    } catch (updateError) {
      setStatusUpdateState((current) => ({
        ...current,
        [orderNumber]: updateError?.message || "Failed"
      }));
    }
  }

  async function handleExpectedDeliveryDateUpdate(order) {
    const orderNumber = order.orderNumber;
    const nextDate = getDraftExpectedDeliveryDate(order);

    if (!nextDate || nextDate === toDateInputValue(order.expectedDeliveryDate)) {
      return;
    }

    setDeliveryDateUpdateState((current) => ({
      ...current,
      [orderNumber]: "saving"
    }));

    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/expected-delivery-date`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ expectedDeliveryDate: nextDate })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to update expected delivery date.");
      }

      const updatedOrder = payload?.order || null;

      setOrders((current) => current.map((entry) => (
        entry.orderNumber === orderNumber
          ? {
            ...entry,
            ...(updatedOrder || {}),
            expectedDeliveryDate: updatedOrder?.expectedDeliveryDate || new Date(nextDate).toISOString()
          }
          : entry
      )));

      setDeliveryDateUpdateState((current) => ({
        ...current,
        [orderNumber]: "saved"
      }));
    } catch (updateError) {
      setDeliveryDateUpdateState((current) => ({
        ...current,
        [orderNumber]: updateError?.message || "Failed"
      }));
    }
  }

  async function handleFetchOrderDetails(orderNumber) {
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const params = new URLSearchParams({ orderNumber });
      const response = await fetch(`/api/orders/track?${params.toString()}`);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to fetch order details.");
      }

      if (!payload?.order) {
        throw new Error("Order details not found.");
      }

      setSelectedOrderDetails(payload.order);

      requestAnimationFrame(() => {
        detailsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (requestError) {
      setSelectedOrderDetails(null);
      setDetailsError(requestError?.message || "Unable to fetch order details.");
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-page__panel">
        <div className="admin-page__header">
          <div>
            <p className="eyebrow">Order Dashboard</p>
          </div>
          {!loading && !error && filteredAndSortedOrders.length > 0 ? (
            <div className="admin-page__header-controls" aria-label="Top pagination controls">
              <label className="admin-page__page-size">
                Items per page
                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value) || 10);
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>

              <div className="admin-page__pagination" aria-label="Pagination controls">
                <button
                  type="button"
                  className="admin-page__tiny-btn"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safeCurrentPage <= 1}
                >
                  Previous
                </button>
                <span>Page {safeCurrentPage} of {totalPages}</span>
                <button
                  type="button"
                  className="admin-page__tiny-btn"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {loading ? <p className="admin-page__meta">Loading orders...</p> : null}
        {error ? <p className="admin-page__error">{error}</p> : null}
        {!loading && !error ? (
          <p className="admin-page__meta">Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} filtered orders ({orders.length} total)</p>
        ) : null}

        <div className="admin-page__controls" aria-label="Order dashboard filters">
          <div className="admin-page__search-row">
            <label className="admin-page__search-control">
              Search Order ID
              <input
                type="search"
                value={orderIdSearch}
                onChange={(event) => setOrderIdSearch(event.target.value)}
                placeholder="Search by order id"
              />
            </label>
            <label className="admin-page__search-control">
              Search Customer (Name / Email)
              <input
                type="search"
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder="Search by customer name or email"
              />
            </label>
          </div>
          <label>
            Status
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
          <label>
            Region
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
              <option value="all">All regions</option>
              {regions.map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </label>
          <label>
            Sort by
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="expected-delivery-nearest">Expected delivery (nearest first)</option>
              <option value="order-date-newest">Order date (newest first)</option>
              <option value="order-date-oldest">Order date (oldest first)</option>
              <option value="amount-high">Amount (high to low)</option>
              <option value="amount-low">Amount (low to high)</option>
            </select>
          </label>
          <div className="admin-page__filter-actions">
            <button
              type="button"
              className="admin-page__tiny-btn admin-page__filter-toggle"
              onClick={() => setShowDateFilters((current) => !current)}
              aria-expanded={showDateFilters}
              aria-controls="admin-date-filter-panel"
            >
              <FilterListIcon fontSize="small" aria-hidden="true" />
              Filters
            </button>
            <button type="button" className="admin-page__tiny-btn" onClick={handleClearAllFilters}>
              Clear all filters
            </button>
          </div>
        </div>

        {showDateFilters ? (
          <section className="admin-page__date-panel" id="admin-date-filter-panel">
            <div className="admin-page__date-options">
              <button
                type="button"
                className={dateFilter === "today" ? "active" : ""}
                onClick={() => setDateFilter("today")}
              >
                Today
              </button>
              <button
                type="button"
                className={dateFilter === "yesterday" ? "active" : ""}
                onClick={() => setDateFilter("yesterday")}
              >
                Yesterday
              </button>
              <button
                type="button"
                className={dateFilter === "last7" ? "active" : ""}
                onClick={() => setDateFilter("last7")}
              >
                Last 7 Days
              </button>
              <button
                type="button"
                className={dateFilter === "custom" ? "active" : ""}
                onClick={() => setDateFilter("custom")}
              >
                Custom Range
              </button>
              <button
                type="button"
                className={dateFilter === "all" ? "active" : ""}
                onClick={() => setDateFilter("all")}
              >
                All Dates
              </button>
            </div>

            {dateFilter === "custom" ? (
              <div className="admin-page__custom-date-range">
                <label>
                  From
                  <input
                    type="date"
                    value={customDateFrom}
                    onChange={(event) => setCustomDateFrom(event.target.value)}
                  />
                </label>
                <label>
                  To
                  <input
                    type="date"
                    value={customDateTo}
                    onChange={(event) => setCustomDateTo(event.target.value)}
                  />
                </label>
              </div>
            ) : null}
          </section>
        ) : null}

        {!loading && !error && filteredAndSortedOrders.length === 0 ? (
          <p className="admin-page__empty">No orders found.</p>
        ) : null}

        <div className="admin-page__table-wrap" role="region" aria-label="Orders table">
          <table className="admin-page__table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Region</th>
                <th>Items</th>
                <th>Status</th>
                <th>Expected Delivery</th>
                <th>Order Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const updateState = statusUpdateState[order.orderNumber] || "";
                const dateUpdateState = deliveryDateUpdateState[order.orderNumber] || "";

                return (
                  <tr key={order.orderNumber}>
                    <td>{order.orderNumber}</td>
                    <td>
                      <div className="admin-page__cell-stack">
                        <strong>{order.customer?.name || "-"}</strong>
                        <span>{order.customer?.email || "-"}</span>
                      </div>
                    </td>
                    <td>{resolveRegionLabel(order)}</td>
                    <td>{getOrderItemCount(order)}</td>
                    <td>
                      <div className="admin-page__status-editor">
                        <div className="admin-page__inline-editor">
                          <select
                            value={getDraftStatus(order)}
                            onChange={(event) => handleDraftStatusChange(order.orderNumber, event.target.value)}
                          >
                            {availableStatuses.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            className="admin-page__tiny-btn"
                            onClick={() => handleStatusUpdate(order)}
                            disabled={updateState === "saving"}
                          >
                            {updateState === "saving" ? "Saving..." : "Update"}
                          </button>
                        </div>
                        {updateState && updateState !== "saving" ? (
                          <span className={updateState === "saved" ? "admin-page__saved" : "admin-page__failed"}>
                            {updateState === "saved" ? "Saved" : updateState}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="admin-page__status-editor">
                        <div className="admin-page__inline-editor">
                          <input
                            type="date"
                            min={minExpectedDeliveryDate}
                            value={getDraftExpectedDeliveryDate(order)}
                            onChange={(event) => handleDraftExpectedDeliveryDateChange(order.orderNumber, event.target.value)}
                          />
                          <button
                            type="button"
                            className="admin-page__tiny-btn"
                            onClick={() => handleExpectedDeliveryDateUpdate(order)}
                            disabled={dateUpdateState === "saving"}
                          >
                            {dateUpdateState === "saving" ? "Saving..." : "Update"}
                          </button>
                        </div>
                        {dateUpdateState && dateUpdateState !== "saving" ? (
                          <span className={dateUpdateState === "saved" ? "admin-page__saved" : "admin-page__failed"}>
                            {dateUpdateState === "saved" ? "Saved" : dateUpdateState}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{currency.format(Number(order.total || 0))}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-page__tiny-btn"
                        onClick={() => handleFetchOrderDetails(order.orderNumber)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-page__mobile-grid">
          {paginatedOrders.map((order) => {
            const updateState = statusUpdateState[order.orderNumber] || "";
            const dateUpdateState = deliveryDateUpdateState[order.orderNumber] || "";

            return (
              <article className="admin-order-card" key={order.orderNumber}>
                <div className="admin-order-card__row">
                  <span>Order</span>
                  <strong>{order.orderNumber}</strong>
                </div>
                <div className="admin-order-card__row">
                  <span>Customer</span>
                  <strong>{order.customer?.name || "-"}</strong>
                </div>
                <div className="admin-order-card__row">
                  <span>Region</span>
                  <strong>{resolveRegionLabel(order)}</strong>
                </div>
                <div className="admin-order-card__row admin-order-card__row--status">
                  <span>Status</span>
                  <select
                    value={getDraftStatus(order)}
                    onChange={(event) => handleDraftStatusChange(order.orderNumber, event.target.value)}
                  >
                    {availableStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-order-card__row">
                  <span>Expected</span>
                  <input
                    type="date"
                    min={minExpectedDeliveryDate}
                    value={getDraftExpectedDeliveryDate(order)}
                    onChange={(event) => handleDraftExpectedDeliveryDateChange(order.orderNumber, event.target.value)}
                  />
                </div>
                <div className="admin-order-card__row">
                  <span>Amount</span>
                  <strong>{currency.format(Number(order.total || 0))}</strong>
                </div>
                <div className="admin-order-card__actions">
                  <button
                    type="button"
                    className="admin-page__tiny-btn"
                    onClick={() => handleStatusUpdate(order)}
                    disabled={updateState === "saving"}
                  >
                    {updateState === "saving" ? "Saving..." : "Update status"}
                  </button>
                  <button
                    type="button"
                    className="admin-page__tiny-btn"
                    onClick={() => handleExpectedDeliveryDateUpdate(order)}
                    disabled={dateUpdateState === "saving"}
                  >
                    {dateUpdateState === "saving" ? "Saving..." : "Update delivery"}
                  </button>
                  <button
                    type="button"
                    className="admin-page__tiny-btn"
                    onClick={() => handleFetchOrderDetails(order.orderNumber)}
                  >
                    Details
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <section className="admin-page__order-details" ref={detailsSectionRef}>
          <h3>Order Details</h3>
          {detailsLoading ? <p className="admin-page__meta">Loading order details...</p> : null}
          {detailsError ? <p className="admin-page__error">{detailsError}</p> : null}

          {!detailsLoading && !detailsError && !selectedOrderDetails ? (
            <p className="admin-page__empty">Select an order and click Details to view full order information.</p>
          ) : null}

          {!detailsLoading && !detailsError && selectedOrderDetails ? (
            <div className="admin-page__details-content">
              <div className="admin-page__details-grid">
                <p><strong>Order Number:</strong> {selectedOrderDetails.orderNumber}</p>
                <p><strong>Status:</strong> {selectedOrderDetails.status || "-"}</p>
                <p><strong>Customer:</strong> {selectedOrderDetails.customer?.name || "-"}</p>
                <p><strong>Email:</strong> {selectedOrderDetails.customer?.email || "-"}</p>
                <p><strong>Phone:</strong> {selectedOrderDetails.customer?.phone || "-"}</p>
                <p><strong>Address:</strong> {selectedOrderDetails.shipping?.address || "-"}</p>
                <p><strong>City:</strong> {selectedOrderDetails.shipping?.city || "-"}</p>
                <p><strong>Region:</strong> {selectedOrderDetails.shipping?.location || "-"}</p>
                <p><strong>Payment:</strong> {selectedOrderDetails.paymentMethod || "-"}</p>
                <p><strong>Order Date:</strong> {formatDate(selectedOrderDetails.createdAt)}</p>
                <p><strong>Expected Delivery:</strong> {formatDate(selectedOrderDetails.expectedDeliveryDate)}</p>
                <p><strong>Subtotal:</strong> {currency.format(Number(selectedOrderDetails.subtotal || 0))}</p>
                <p><strong>Shipping:</strong> {currency.format(Number(selectedOrderDetails.shippingCharge || 0))}</p>
                <p><strong>Total:</strong> {currency.format(Number(selectedOrderDetails.total || 0))}</p>
              </div>

              <div className="admin-page__details-items">
                <h4>Items</h4>
                {Array.isArray(selectedOrderDetails.items) && selectedOrderDetails.items.length > 0 ? (
                  <table className="admin-page__details-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.items.map((item) => (
                        <tr key={`${selectedOrderDetails.orderNumber}-${item.id}-${item.productSku}`}>
                          <td>
                            {productImageBySku[item.productSku] ? (
                              <img
                                src={productImageBySku[item.productSku]}
                                alt={item.productName || item.productSku}
                                className="admin-page__item-image"
                                loading="lazy"
                              />
                            ) : (
                              <span className="admin-page__item-image-fallback">No image</span>
                            )}
                          </td>
                          <td>{item.productSku}</td>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{currency.format(Number(item.unitPrice || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="admin-page__empty">No items found for this order.</p>
                )}
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}
