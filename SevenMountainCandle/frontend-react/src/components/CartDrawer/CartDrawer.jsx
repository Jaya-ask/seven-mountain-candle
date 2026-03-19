import { useEffect, useRef } from "react";
import "./CartDrawer.scss";

export default function CartDrawer({
  open,
  cart,
  subtotal,
  onClose,
  onUpdateQuantity,
  currency
}) {
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open, onClose]);

  return (
    <aside ref={drawerRef} className={`cart-drawer ${open ? "open" : ""}`}>
      <div className="cart-header">
        <div>
          <p className="eyebrow">Your Basket</p>
          <h3>Candle Cart</h3>
        </div>
        <button
          type="button"
          className="close-button"
          onClick={onClose}
          aria-label="Close cart"
        >
          <span aria-hidden="true">&times;</span>
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


