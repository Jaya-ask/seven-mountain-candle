import { useEffect, useState } from "react";

function normalizeReview(review, index) {
  const parsedRating =
    typeof review.rating === "number"
      ? review.rating
      : typeof review.stars === "number"
        ? review.stars
        : Number(review.rating ?? review.stars ?? 0);

  return {
    id: review.id ?? `${review.name ?? review.customerName ?? "review"}-${index}`,
    name: review.name ?? review.customerName ?? "Customer",
    title: review.title ?? review.heading ?? "",
    comment: review.comment ?? review.message ?? "",
    rating: Number.isFinite(parsedRating) ? parsedRating : 0,
    createdAt: review.createdAt ?? review.created_at ?? null,
    createdDate: review.createdDate ?? review.created_date ?? null
  };
}

async function fetchProductReviews(productId, signal) {
  const encodedId = encodeURIComponent(productId);
  const endpoints = [
    `/api/products/${encodedId}/reviews`,
    `/api/reviews?productId=${encodedId}`
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { signal });
      if (!response.ok) {
        throw new Error(`Failed to load reviews from ${endpoint}`);
      }

      const payload = await response.json();
      const rawReviews = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.reviews)
          ? payload.reviews
          : [];

      return rawReviews.map(normalizeReview);
    } catch (error) {
      lastError = error;
      if (error.name === "AbortError") {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Unable to fetch product reviews");
}

function getProductId(product) {
  return product?.id ?? product?.sku ?? product?.productNumber ?? product?.number;
}

async function postProductReview(productId, review) {
  const encodedId = encodeURIComponent(productId);
  const response = await fetch(`/api/products/${encodedId}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(review)
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Failed to submit review.");
  }

  return normalizeReview(payload, 0);
}

export default function useProductReviews(product) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const productId = getProductId(product);

  useEffect(() => {
    if (!productId) {
      setReviews([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function loadReviews() {
      setLoading(true);
      setError(null);

      try {
        const nextReviews = await fetchProductReviews(productId, controller.signal);
        setReviews(nextReviews);
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setReviews([]);
          setError(loadError);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadReviews();

    return () => controller.abort();
  }, [productId]);

  async function submitReview(reviewPayload) {
    if (!productId) {
      throw new Error("Product id is missing.");
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const createdReview = await postProductReview(productId, reviewPayload);
      setReviews((currentReviews) => [createdReview, ...currentReviews]);
      return createdReview;
    } catch (submitReviewError) {
      setSubmitError(submitReviewError);
      throw submitReviewError;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    reviews,
    loading,
    error,
    submitting,
    submitError,
    submitReview
  };
}
