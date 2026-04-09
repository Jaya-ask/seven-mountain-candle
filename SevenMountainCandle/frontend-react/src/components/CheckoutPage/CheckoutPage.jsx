import { useEffect, useMemo, useRef, useState } from "react";
import "./CheckoutPage.scss";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  addressTag: "Home",
  paymentMethod: "card"
};

function isValidPhoneNumber(phoneValue) {
  const trimmedPhone = phoneValue?.toString().trim() || "";

  // Allow common phone characters while enforcing a realistic digit count.
  if (!/^\+?[0-9\s()-]+$/.test(trimmedPhone)) {
    return false;
  }

  const digitCount = (trimmedPhone.match(/\d/g) || []).length;
  return digitCount >= 8 && digitCount <= 15;
}

export default function CheckoutPage({
  cart,
  subtotal,
  currency,
  authToken,
  authUser,
  onAuthUserUpdate,
  onBackToShop,
  onPlaceOrder,
  onContinueAfterOrder
}) {
  const [form, setForm] = useState(initialForm);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [newAddressModalOpen, setNewAddressModalOpen] = useState(false);
  const [newAddressDraft, setNewAddressDraft] = useState({
    address: "",
    city: "",
    tag: "Home"
  });
  const [newAddressErrors, setNewAddressErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [addressSaving, setAddressSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [checkoutHint, setCheckoutHint] = useState("");
  const [shippingLocation, setShippingLocation] = useState("");
  const [draftShippingLocation, setDraftShippingLocation] = useState("dubai");
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [orderConfirmationOpen, setOrderConfirmationOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const shippingLinkRef = useRef(null);
  const isLoggedInUser = Boolean(authToken);

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

  useEffect(() => {
    if (!authUser) {
      return;
    }

    setForm((current) => ({
      ...current,
      fullName: authUser.name || current.fullName,
      email: authUser.email || current.email,
      phone: authUser.phone || current.phone,
      address: authUser.address || current.address,
      city: authUser.city || current.city
    }));
  }, [authUser]);

  useEffect(() => {
    if (!authToken) {
      return;
    }

    let isCancelled = false;

    async function loadProfile() {
      setProfileLoading(true);

      try {
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.message || "Unable to load profile.");
        }

        if (isCancelled) {
          return;
        }

        const addresses = Array.isArray(payload.addresses) ? payload.addresses : [];
        const recentAddress = payload.recentAddress || addresses[0] || null;

        setSavedAddresses(addresses);
        setSelectedAddressId(recentAddress?.id ? String(recentAddress.id) : "");
        setForm((current) => ({
          ...current,
          fullName: payload.user?.name || current.fullName,
          email: payload.user?.email || current.email,
          phone: payload.user?.phone || current.phone,
          address: recentAddress?.address || current.address,
          city: recentAddress?.city || current.city,
          addressTag: recentAddress?.tag || current.addressTag || "Home"
        }));

        if (payload.user && typeof onAuthUserUpdate === "function") {
          onAuthUserUpdate(payload.user);
        }
      } catch (profileError) {
        if (!isCancelled) {
          setCheckoutHint(profileError?.message || "Unable to load saved addresses.");
        }
      } finally {
        if (!isCancelled) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [authToken]);

  const grandTotal = subtotal + shippingCharge;
  const isPlaceOrderDisabled = !shippingLocation || profileLoading || addressSaving;

  function handleInputChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleSavedAddressChange(event) {
    const nextAddressId = event.target.value;

    if (nextAddressId === "new") {
      setNewAddressDraft({ address: "", city: "", tag: "Home" });
      setNewAddressErrors({});
      setNewAddressModalOpen(true);
      return;
    }

    setSelectedAddressId(nextAddressId);

    const selectedAddress = savedAddresses.find((entry) => String(entry.id) === nextAddressId);
    if (!selectedAddress) {
      return;
    }

    setForm((current) => ({
      ...current,
      address: selectedAddress.address,
      city: selectedAddress.city,
      addressTag: selectedAddress.tag || "Address"
    }));
    setErrors((current) => ({ ...current, address: "", city: "" }));
  }

  function handleNewAddressDraftChange(event) {
    const { name, value } = event.target;
    setNewAddressDraft((current) => ({ ...current, [name]: value }));
    setNewAddressErrors((current) => ({ ...current, [name]: "" }));
  }

  async function saveNewAddress() {
    if (!isLoggedInUser) {
      return;
    }

    const validationErrors = {};
    if (!newAddressDraft.address.trim()) {
      validationErrors.address = "Address is required.";
    }

    if (!newAddressDraft.city.trim()) {
      validationErrors.city = "City is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setNewAddressErrors(validationErrors);
      return;
    }

    setAddressSaving(true);

    try {
      const response = await fetch("/api/auth/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          address: newAddressDraft.address,
          city: newAddressDraft.city,
          tag: newAddressDraft.tag || "Address"
        })
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to save new address.");
      }

      const createdAddress = payload.address;

      if (createdAddress) {
        setSavedAddresses((current) => [
          createdAddress,
          ...current.filter((entry) => String(entry.id) !== String(createdAddress.id))
        ]);
        setSelectedAddressId(String(createdAddress.id));
        setForm((current) => ({
          ...current,
          address: createdAddress.address,
          city: createdAddress.city,
          addressTag: createdAddress.tag || "Address"
        }));
      }

      if (typeof onAuthUserUpdate === "function") {
        onAuthUserUpdate({
          ...authUser,
          address: newAddressDraft.address,
          city: newAddressDraft.city
        });
      }

      setNewAddressModalOpen(false);
      setNewAddressErrors({});
    } finally {
      setAddressSaving(false);
    }
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
    } else if (!isValidPhoneNumber(form.phone)) {
      nextErrors.phone = "Enter a valid phone number.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
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

    try {
      const orderResponse = await onPlaceOrder({
        customer: form,
        items: cart,
        subtotal,
        shippingCharge,
        shippingLocation,
        total: grandTotal,
        paymentMethod: form.paymentMethod
      });

      setOrderId(orderResponse?.orderId || orderResponse?.orderNumber || "");
      setOrderPlaced(true);
      setOrderConfirmationOpen(true);
      setForm((current) => ({ ...current }));
      setErrors({});
      setCheckoutHint("");
    } catch (submitError) {
      setCheckoutHint(submitError?.message || "Unable to place order right now.");
    }
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
              disabled={isLoggedInUser}
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
              disabled={isLoggedInUser}
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
              inputMode="tel"
              autoComplete="tel"
              placeholder="Enter valid phone number"
              disabled={isLoggedInUser}
            />
            {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
          </label>

          <label>
            Address
            {isLoggedInUser ? (
              <>
                <div className="address-select-row">
                  <select value={selectedAddressId} onChange={handleSavedAddressChange}>
                    <option value="" disabled>Select saved address</option>
                    {savedAddresses.map((entry) => (
                      <option key={entry.id} value={String(entry.id)}>
                        {entry.tag}: {entry.address}, {entry.city}
                      </option>
                    ))}
                    <option value="new">Add new address</option>
                  </select>
                  <button
                    type="button"
                    className="inline-link"
                    onClick={() => {
                      setNewAddressDraft({ address: "", city: "", tag: "Home" });
                      setNewAddressErrors({});
                      setNewAddressModalOpen(true);
                    }}
                  >
                    Add new address
                  </button>
                </div>
              </>
            ) : (
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleInputChange}
              />
            )}
            {errors.address ? <span className="field-error">{errors.address}</span> : null}
          </label>

          <label>
            City
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleInputChange}
              readOnly={isLoggedInUser}
            />
            {errors.city ? <span className="field-error">{errors.city}</span> : null}
          </label>

          {isLoggedInUser && newAddressModalOpen ? (
            <div className="address-modal-backdrop" role="presentation">
              <div className="address-modal" role="dialog" aria-modal="true" aria-labelledby="add-address-title">
                <h3 id="add-address-title">Add new address</h3>

                <label>
                  Address
                  <input
                    type="text"
                    name="address"
                    value={newAddressDraft.address}
                    onChange={handleNewAddressDraftChange}
                    placeholder="Flat/Villa, Street, Area"
                  />
                  {newAddressErrors.address ? <span className="field-error">{newAddressErrors.address}</span> : null}
                </label>

                <label>
                  City
                  <input
                    type="text"
                    name="city"
                    value={newAddressDraft.city}
                    onChange={handleNewAddressDraftChange}
                    placeholder="Dubai"
                  />
                  {newAddressErrors.city ? <span className="field-error">{newAddressErrors.city}</span> : null}
                </label>

                <label>
                  Address Tag
                  <input
                    type="text"
                    name="tag"
                    value={newAddressDraft.tag}
                    onChange={handleNewAddressDraftChange}
                    placeholder="Home, Office, Other"
                  />
                </label>

                <div className="address-modal-actions">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      setNewAddressModalOpen(false);
                      setNewAddressErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={saveNewAddress} disabled={addressSaving}>
                    {addressSaving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

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
              title={
                isPlaceOrderDisabled
                  ? (addressSaving ? "Saving address..." : "Finish shipping calculation")
                  : ""
              }
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
