import {
  getAllOrdersForAdmin,
  updateExpectedDeliveryDateForAdmin,
  updateOrderStatusForAdmin
} from "../services/orderService.js";

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
