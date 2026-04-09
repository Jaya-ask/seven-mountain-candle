import { useEffect, useRef } from "react";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import "./CartDrawer.scss";

export default function CartDrawer({
  open,
  cart,
  subtotal,
  onClose,
  onUpdateQuantity,
  onProceedToCheckout,
  onShopNow,
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

  function handleShopNowClick() {
    onClose();

    if (typeof onShopNow === "function") {
      onShopNow();
    }
  }

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
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <button type="button" className="empty-cart-link" onClick={handleShopNowClick}>
              Shop now
            </button>
          </div>
        ) : (
          cart.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item-main">
                <div className="cart-thumb" aria-hidden="true">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} loading="lazy" />
                  ) : (
                    <span>{item.name.slice(0, 1)}</span>
                  )}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    {item.sku} · {currency.format(item.price)}
                  </p>
                </div>
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
                <button
                  type="button"
                  className="remove-item-button"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => onUpdateQuantity(item.id, 0)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" aria-hidden="true" />
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
        <button
          type="button"
          className="checkout-button"
          onClick={onProceedToCheckout}
          disabled={cart.length === 0}
        >
          Proceed to checkout
        </button>
      </div>
    </aside>
  );
}


