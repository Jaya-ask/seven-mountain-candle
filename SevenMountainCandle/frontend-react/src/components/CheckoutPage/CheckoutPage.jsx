import { useMemo, useRef, useState } from "react";
import "./CheckoutPage.scss";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  paymentMethod: "card"
};

export default function CheckoutPage({
  cart,
  subtotal,
  currency,
  onBackToShop,
  onPlaceOrder,
  onContinueAfterOrder
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutHint, setCheckoutHint] = useState("");
  const [shippingLocation, setShippingLocation] = useState("");
  const [draftShippingLocation, setDraftShippingLocation] = useState("dubai");
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const shippingLinkRef = useRef(null);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const shippingCharge = useMemo(() => {
    if (shippingLocation === "dubai") {
      return 20;
    }

    if (shippingLocation === "sarjah") {
      return 25;
    }

    return 0;
  }, [shippingLocation]);

  const grandTotal = subtotal + shippingCharge;
  const isPlaceOrderDisabled = !shippingLocation;

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim() || !form.email.includes("@")) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!shippingLocation) {
      setCheckoutHint("Finish shipping calculation");
      shippingLinkRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      shippingLinkRef.current?.focus({ preventScroll: true });
      return;
    }

    setCheckoutHint("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onPlaceOrder({
      customer: form,
      items: cart,
      subtotal,
      shippingCharge,
      shippingLocation,
      total: grandTotal,
      paymentMethod: form.paymentMethod
    });

    const generatedOrderId = `SMC-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
    setOrderId(generatedOrderId);
    setOrderPlaced(true);
    setOrderConfirmationOpen(true);
    setForm(initialForm);
    setErrors({});
  }

  function openShippingModal() {
    setDraftShippingLocation(shippingLocation || "dubai");
    setShippingModalOpen(true);
  }

  function applyShippingSelection() {
    setShippingLocation(draftShippingLocation);
    setCheckoutHint("");
    setShippingModalOpen(false);
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <p className="eyebrow">Checkout</p>
          <h2>Your cart is empty</h2>
          <p>Add products to your cart before proceeding to checkout.</p>
          <button type="button" onClick={onBackToShop}>
            Back to shop
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <section className="checkout-form-panel">
        <p className="eyebrow">Checkout</p>
        <h2>Shipping and payment details</h2>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Full Name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleInputChange}
            />
            {errors.fullName ? <span className="field-error">{errors.fullName}</span> : null}
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
            />
            {errors.email ? <span className="field-error">{errors.email}</span> : null}
          </label>

          <label>
            Phone
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
            />
            {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
          </label>

          <label>
            Address
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleInputChange}
            />
            {errors.address ? <span className="field-error">{errors.address}</span> : null}
          </label>

          <label>
            City
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleInputChange}
            />
            {errors.city ? <span className="field-error">{errors.city}</span> : null}
          </label>

          <label>
            Payment Method
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleInputChange}
            >
              <option value="card">Credit / Debit Card</option>
              <option value="cod">Cash on Delivery</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </label>

          <div className="checkout-actions">
            <button type="button" className="secondary" onClick={onBackToShop}>
              Back to shop
            </button>
            <button
              type="submit"
              aria-disabled={isPlaceOrderDisabled}
              className={isPlaceOrderDisabled ? "pseudo-disabled" : ""}
              title={isPlaceOrderDisabled ? "Finish shipping calculation" : ""}
            >
              Place order
            </button>
          </div>
          {checkoutHint ? <p className="checkout-hint">{checkoutHint}</p> : null}
        </form>
      </section>

      <aside className="checkout-summary-panel">
        <h3>Order summary</h3>
        <p>{totalItems} items</p>
        <div className="checkout-lines">
          {cart.map((item) => (
            <div key={item.id} className="checkout-line-item">
              <span>{item.name} x {item.quantity}</span>
              <strong>{currency.format(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="checkout-line-item shipping-row">
            <span>Shipping charges</span>
            {shippingLocation ? (
              <strong>{currency.format(shippingCharge)}</strong>
            ) : (
              <button
                ref={shippingLinkRef}
                type="button"
                className="inline-link"
                onClick={openShippingModal}
              >
                Calculate shipping charges
              </button>
            )}
          </div>
        </div>

        {shippingLocation ? (
          <p className="shipping-info">
            Delivery is to {shippingLocation === "dubai" ? "Dubai" : "Sarjah"}.{" "}
            <button type="button" className="inline-link" onClick={openShippingModal}>
              Edit
            </button>
          </p>
        ) : null}

        <div className="checkout-total">
          <span>Total</span>
          <strong>{currency.format(grandTotal)}</strong>
        </div>
      </aside>

      {shippingModalOpen ? (
        <div className="shipping-modal-backdrop" role="presentation">
          <div className="shipping-modal" role="dialog" aria-modal="true" aria-labelledby="shipping-modal-title">
            <h3 id="shipping-modal-title">Select delivery location</h3>
            <div className="shipping-options">
              <label>
                <input
                  type="radio"
                  name="shippingLocation"
                  value="dubai"
                  checked={draftShippingLocation === "dubai"}
                  onChange={(event) => setDraftShippingLocation(event.target.value)}
                />
                Dubai (Shipping: {currency.format(20)})
              </label>
              <label>
                <input
                  type="radio"
                  name="shippingLocation"
                  value="sarjah"
                  checked={draftShippingLocation === "sarjah"}
                  onChange={(event) => setDraftShippingLocation(event.target.value)}
                />
                Sarjah (Shipping: {currency.format(25)})
              </label>
            </div>
            <div className="shipping-modal-actions">
              <button type="button" className="secondary" onClick={() => setShippingModalOpen(false)}>
                Cancel
              </button>
              <button type="button" onClick={applyShippingSelection}>
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {orderConfirmationOpen ? (
        <div className="order-modal-backdrop" role="presentation">
          <section className="checkout-success order-confirmation-popup" role="dialog" aria-modal="true" aria-labelledby="order-confirmed-title">
            <p className="eyebrow">Order Confirmed</p>
            <h2 id="order-confirmed-title">Your order has been placed successfully.</h2>
            <p>
              Thank you for shopping with Seven Mountains Candle Studio. A confirmation
              email will be sent shortly.
            </p>
            <p className="order-id-line">
              Order ID: <strong>{orderId}</strong>
            </p>
            <button
              type="button"
              onClick={() => {
                setOrderConfirmationOpen(false);
                onContinueAfterOrder();
              }}
            >
              Continue shopping
            </button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
