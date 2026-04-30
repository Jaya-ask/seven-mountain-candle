import { useEffect } from "react";

export default function GuestCheckoutPrompt({
  open,
  onClose,
  onContinueAsGuest,
  onLogin
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="guest-checkout-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="guest-checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-checkout-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="eyebrow">Checkout</p>
        <h3 id="guest-checkout-title">Login before checkout?</h3>
        <p>
          You can login to use saved details and track orders in your account, or continue as guest.
        </p>
        <div className="guest-checkout-modal-actions">
          <button
            type="button"
            className="secondary"
            onClick={onContinueAsGuest}
          >
            Continue as guest
          </button>
          <button
            type="button"
            className="primary"
            onClick={onLogin}
          >
            Login
          </button>
        </div>
      </section>
    </div>
  );
}
