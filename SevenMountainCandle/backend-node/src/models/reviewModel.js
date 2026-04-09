export function createReviewModel(row) {
  const createdAtValue = row.created_at ? new Date(row.created_at).toISOString() : null;

  return {
    id: row.id,
    productSku: row.product_sku,
    name: row.customer_name,
    title: row.title || "",
    comment: row.comment,
    rating: Number(row.rating),
    createdAt: createdAtValue,
    createdDate: createdAtValue ? createdAtValue.slice(0, 10) : null
  };
}
