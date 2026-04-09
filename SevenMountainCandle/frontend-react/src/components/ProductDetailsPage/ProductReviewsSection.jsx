export default function ProductReviewsSection({
  reviews,
  showReviewForm,
  reviewDraft,
  reviewsLoading,
  reviewsError,
  submitting,
  submitError,
  onShowReviewForm,
  onReviewFieldChange,
  onReviewSubmit,
  renderStars,
  formatReviewDate
}) {
  return (
    <section className="product-reviews" aria-label="Customer reviews">
      <div className="product-reviews-header">
        <h3>Customer Reviews</h3>
        <button
          type="button"
          className="product-details-inline-review-button"
          onClick={onShowReviewForm}
        >
          Write a review
        </button>
      </div>

      {showReviewForm ? (
        <form className="review-form" onSubmit={onReviewSubmit}>
          <label>
            Your name
            <input
              type="text"
              value={reviewDraft.name}
              onChange={(event) => onReviewFieldChange("name", event.target.value)}
              required
            />
          </label>
          <label>
            Review title
            <input
              type="text"
              value={reviewDraft.title}
              onChange={(event) => onReviewFieldChange("title", event.target.value)}
            />
          </label>
          <label>
            Rating
            <select
              value={reviewDraft.rating}
              onChange={(event) => onReviewFieldChange("rating", Number(event.target.value))}
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </label>
          <label>
            Review
            <textarea
              value={reviewDraft.comment}
              onChange={(event) => onReviewFieldChange("comment", event.target.value)}
              rows={4}
              required
            />
          </label>
          <div className="review-form-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit review"}
            </button>
          </div>
          {submitError ? <p className="review-state error">{submitError.message}</p> : null}
        </form>
      ) : null}

      {reviewsLoading ? <p className="review-state">Loading reviews...</p> : null}
      {reviewsError ? <p className="review-state error">Unable to load reviews right now.</p> : null}
      {!reviewsLoading && reviews.length === 0 && !reviewsError ? (
        <p className="review-state">No reviews available for this product yet.</p>
      ) : null}

      {reviews.length > 0 ? (
        <div className="product-reviews-grid">
          {reviews.map((review, index) => (
            <article className="review-card" key={review.id ?? `${review.name}-${index}`}>
              <div className="review-header">
                <div className="review-author">
                  <strong>{review.name}</strong>
                  {formatReviewDate(review) ? <span className="review-date">{formatReviewDate(review)}</span> : null}
                </div>
                <span className="review-stars">{renderStars(review.rating)}</span>
              </div>
              {review.title ? <h4>{review.title}</h4> : null}
              <p>{review.comment}</p>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
