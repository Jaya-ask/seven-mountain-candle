import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

export default function ProductNotFound({ onBackToShop }) {
  return (
    <main className="product-details-page">
      <section className="product-details-panel">
        <h2>Product not found</h2>
        <p>The selected candle could not be loaded.</p>
        <button
          type="button"
          className="product-details-panel-back-button"
          onClick={onBackToShop}
          aria-label="Back to shop"
        >
          <ArrowBackIosNewRoundedIcon fontSize="small" />
          <span>Back to shop</span>
        </button>
      </section>
    </main>
  );
}
