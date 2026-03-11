import "../styles/CartDrawer.css";

export default function CartDrawer({
  open,
  cart,
  subtotal,
  onClose,
  onUpdateQuantity,
  currency
}) {
  return (
    <aside className={`cart-drawer ${open ? "open" : ""}`}>
      <div className="cart-header">
        <div>
          <p className="eyebrow">Your Basket</p>
          <h3>Candle Cart</h3>
        </div>
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="cart-items">
        {cart.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <p>
                  {item.sku} · {currency.format(item.price)}
                </p>
              </div>
              <div className="quantity-controls">
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-footer">
        <div className="subtotal-row">
          <span>Subtotal</span>
          <strong>{subtotal}</strong>
        </div>
        <button type="button" className="checkout-button">
          Proceed to checkout
        </button>
      </div>
    </aside>
  );
}
