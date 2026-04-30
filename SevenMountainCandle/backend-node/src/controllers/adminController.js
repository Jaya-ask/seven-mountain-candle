import {
  getAllOrdersForAdmin,
  updateExpectedDeliveryDateForAdmin,
  updateOrderStatusForAdmin
} from "../services/orderService.js";
import {
  createAdminProduct,
  deleteAdminProductImage,
  deleteAdminProduct,
  getAdminProductsPayload,
  uploadAdminProductImage,
  updateAdminProduct
} from "../services/adminProductService.js";

export async function getAdminOrders(_request, response) {
  const ordersPayload = await getAllOrdersForAdmin();
  response.json(ordersPayload);
}

export async function updateAdminOrderStatus(request, response) {
  const orderNumber = request.params.orderNumber;
  const status = request.body?.status;

  const payload = await updateOrderStatusForAdmin({
    orderNumber,
    status
  });

  response.status(200).json(payload);
}

export async function updateAdminExpectedDeliveryDate(request, response) {
  const orderNumber = request.params.orderNumber;
  const expectedDeliveryDate = request.body?.expectedDeliveryDate;

  const payload = await updateExpectedDeliveryDateForAdmin({
    orderNumber,
    expectedDeliveryDate
  });

  response.status(200).json(payload);
}

export async function getAdminProducts(_request, response) {
  const payload = await getAdminProductsPayload();
  response.json(payload);
}

export async function createAdminProductHandler(request, response) {
  const payload = await createAdminProduct(request.body || {});
  response.status(201).json(payload);
}

export async function updateAdminProductHandler(request, response) {
  const payload = await updateAdminProduct({
    existingSku: request.params.productSku,
    payload: request.body || {}
  });

  response.status(200).json(payload);
}

export async function deleteAdminProductHandler(request, response) {
  const payload = await deleteAdminProduct(request.params.productSku);
  response.status(200).json(payload);
}

export async function uploadAdminProductImageHandler(request, response) {
  const payload = await uploadAdminProductImage({
    sku: request.params.productSku,
    file: request.file
  });

  response.status(201).json(payload);
}

export async function deleteAdminProductImageHandler(request, response) {
  const payload = await deleteAdminProductImage({
    sku: request.params.productSku,
    imageUrl: request.body?.imageUrl
  });

  response.status(200).json(payload);
}
