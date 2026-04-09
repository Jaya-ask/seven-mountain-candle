import { getFeaturedProducts, getProductsByFilters } from "../services/catalogService.js";

export async function getProducts(request, response) {
  const category = request.query.category?.toString().toLowerCase();
  const search = request.query.search?.toLowerCase();

  const filteredProducts = await getProductsByFilters({ category, search });
  response.json(filteredProducts);
}

export async function getFeaturedProductsList(_request, response) {
  const featured = await getFeaturedProducts();
  response.json(featured);
}
