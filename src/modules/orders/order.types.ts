import { PaymentMethod } from "../../../generated/prisma/enums";

export type DeliveryType = "DELIVERY" | "PICKUP";

export type OrderItemAddonInput = {
  name: string;
  price: number;
};

export type OrderItemInput = {
  productId: string;
  quantity: number;
  observation?: string;
  addons?: OrderItemAddonInput[];
};

type BaseCreateOrderInput = {
  userId: string;
  deliveryDistrict: string;
  paymentMethod: PaymentMethod;
  changeFor?: number;
  observation?: string;
  items: OrderItemInput[];
};

export type CreateOrderDeliveryInput = BaseCreateOrderInput & {
  deliveryType: "DELIVERY";
  addressId: string;
};

export type CreateOrderPickupInput = BaseCreateOrderInput & {
  deliveryType: "PICKUP";
  addressId?: never;
};

export type CreateOrderInput =
  | CreateOrderDeliveryInput
  | CreateOrderPickupInput;

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  total: number;
}
