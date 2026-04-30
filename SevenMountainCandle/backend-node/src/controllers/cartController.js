import {
  clearAuthenticatedCart,
  getAuthenticatedCart,
  saveAuthenticatedCart
} from "../services/cartService.js";

export async function getMyCart(request, response) {
  const cart = await getAuthenticatedCart({
    userId: request.auth?.userId
  });

  response.json(cart);
}

export async function saveMyCart(request, response) {
  const cart = await saveAuthenticatedCart({
    userId: request.auth?.userId,
    items: request.body?.items || []
  });

  response.json(cart);
}

export async function clearMyCart(request, response) {
  const cart = await clearAuthenticatedCart({
    userId: request.auth?.userId
  });

  response.json(cart);
}
