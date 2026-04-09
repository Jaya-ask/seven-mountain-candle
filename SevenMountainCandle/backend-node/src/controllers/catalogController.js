import { getCatalogData } from "../services/catalogService.js";

export async function getCatalog(_request, response) {
  const catalogData = await getCatalogData();
  response.json(catalogData);
}
