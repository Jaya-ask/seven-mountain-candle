import { createCatalogModel } from "../models/catalogModel.js";
import { createCategoryModel } from "../models/categoryModel.js";
import {
  createProductModelFromRow,
  productMatchesCategory,
  productMatchesSearch
} from "../models/productModel.js";
import { getCategories, getCatalogProducts } from "../repositories/catalogRepository.js";
import AppError from "../utils/AppError.js";

export async function getCatalogData() {
  try {
    const [categoryRows, productRows] = await Promise.all([getCategories(), getCatalogProducts()]);

    const categories = categoryRows.map((row) => createCategoryModel(row));
    const products = productRows.map((row, index) => createProductModelFromRow(row, index));

    return createCatalogModel({ categories, products });
  } catch (error) {
    throw new AppError("Failed to load catalog data.", 500);
  }
}

export async function getProductsByFilters({ category, search }) {
  try {
    const { products } = await getCatalogData();

    return products.filter(
      (product) => productMatchesCategory(product, category) && productMatchesSearch(product, search)
    );
  } catch (error) {
    if (error instanceof AppError && error.message === "Failed to load catalog data.") {
      throw new AppError("Failed to load products.", 500);
    }
    throw error;
  }
}

export async function getFeaturedProducts() {
  try {
    const { products } = await getCatalogData();
    return products.filter((product) => product.featured);
  } catch (error) {
    if (error instanceof AppError && error.message === "Failed to load catalog data.") {
      throw new AppError("Failed to load featured products.", 500);
    }
    throw error;
  }
}
