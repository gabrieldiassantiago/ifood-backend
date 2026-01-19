import { OrderStatus, PaymentMethod, DeliveryType } from "../../../generated/prisma/enums";

export interface CreateOrderInput {
  userId: string;
  addressId: string;
  deliveryDistrict: string;
  deliveryType?: DeliveryType;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  observation?: string;
  items: OrderItemInput[];
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  addons?: OrderItemAddonInput[];
  observation?: string;
}

export interface OrderItemAddonInput {
  name: string;
  price: number;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  status: OrderStatus;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
}
