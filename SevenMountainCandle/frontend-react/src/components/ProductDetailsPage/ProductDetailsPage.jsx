import { useEffect, useMemo, useState } from "react";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";

import "./ProductDetailsPage.scss";
import useProductReviews from "../../hooks/useProductReviews";
import ProductInfoColumn from "./ProductInfoColumn";
import ProductMediaGallery from "./ProductMediaGallery";
import ProductNotFound from "./ProductNotFound";
import ProductPurchaseBox from "./ProductPurchaseBox";
import ProductReviewsSection from "./ProductReviewsSection";

function renderStars(rating) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
}

function formatReviewDate(review) {
  const dateValue = review?.createdAt ?? review?.createdDate;
  if (!dateValue) {
    return null;
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function ProductDetailsPage({
  product,
  currency,
  onBackToShop,
  onAddToCart,
  onBuyNow,
  onReviewSubmitted
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({
    name: "",
    title: "",
    comment: "",
    rating: 5
  });

  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    submitting,
    submitError,
    submitReview
  } = useProductReviews(product);

  const productImages = useMemo(() => {
    const objectImageUrls = Array.isArray(product?.images)
      ? product.images
          .map((entry) => {
            if (typeof entry === "string") {
              return entry;
            }

            return entry?.url;
          })
          .filter(Boolean)
      : [];

    const candidates = [
      ...objectImageUrls,
      ...(Array.isArray(product?.galleryImages) ? product.galleryImages : []),
      product?.imageUrl
    ].filter(Boolean);

    return [...new Set(candidates)];
  }, [product?.galleryImages, product?.imageUrl, product?.images]);

  const selectedImage = productImages[selectedImageIndex] || productImages[0] || null;
  const hasMultipleImages = productImages.length > 1;

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id, product?.sku]);

  if (!product) {
    return <ProductNotFound onBackToShop={onBackToShop} />;
  }

  const notes = Array.isArray(product.notes) ? product.notes : [];

  const averageRating =
    typeof product.rating === "number"
      ? product.rating
      : reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

  function handleReviewFieldChange(field, value) {
    setReviewDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value
    }));
  }

  async function handleReviewSubmit(event) {
    event.preventDefault();

    try {
      await submitReview(reviewDraft);
      setReviewDraft({ name: "", title: "", comment: "", rating: 5 });
      setShowReviewForm(false);

      if (typeof onReviewSubmitted === "function") {
        try {
          await onReviewSubmitted();
        } catch (refreshError) {
          console.error("Failed to refresh catalog after review submit", refreshError);
        }
      }
    } catch (_error) {
      // submitError from hook already carries the message shown in the UI.
    }
  }

  function goToPreviousImage() {
    setSelectedImageIndex((currentIndex) => {
      if (!hasMultipleImages) {
        return currentIndex;
      }
      return (currentIndex - 1 + productImages.length) % productImages.length;
    });
  }

  function goToNextImage() {
    setSelectedImageIndex((currentIndex) => {
      if (!hasMultipleImages) {
        return currentIndex;
      }
      return (currentIndex + 1) % productImages.length;
    });
  }

  return (
    <main className="product-details-page">
      <section className="product-details-shell">
        <div className="product-details-back">
          <button type="button" className="back-icon-button" onClick={onBackToShop} aria-label="Back to shop">
            <ArrowBackIosNewRoundedIcon fontSize="small" />
          </button>
        </div>

        <div className="product-details-layout">
          <ProductMediaGallery
            product={product}
            productImages={productImages}
            selectedImageIndex={selectedImageIndex}
            selectedImage={selectedImage}
            hasMultipleImages={hasMultipleImages}
            onSelectImage={setSelectedImageIndex}
            onPreviousImage={goToPreviousImage}
            onNextImage={goToNextImage}
          />

          <ProductInfoColumn
            product={product}
            notes={notes}
            averageRating={averageRating}
            reviewsCount={reviews.length}
            currency={currency}
            renderStars={renderStars}
          />

          <ProductPurchaseBox
            product={product}
            currency={currency}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
            showReviewForm={showReviewForm}
            onToggleReviewForm={() => setShowReviewForm((currentValue) => !currentValue)}
          />
        </div>

        <ProductReviewsSection
          reviews={reviews}
          showReviewForm={showReviewForm}
          reviewDraft={reviewDraft}
          reviewsLoading={reviewsLoading}
          reviewsError={reviewsError}
          submitting={submitting}
          submitError={submitError}
          onShowReviewForm={() => setShowReviewForm(true)}
          onReviewFieldChange={handleReviewFieldChange}
          onReviewSubmit={handleReviewSubmit}
          renderStars={renderStars}
          formatReviewDate={formatReviewDate}
        />
      </section>
    </main>
  );
}
