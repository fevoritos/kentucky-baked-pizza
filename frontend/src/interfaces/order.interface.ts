import type { IProduct } from './product.interface';

export interface IOrderItem {
  orderId: number;
  dishId: number;
  quantity: number;
  price: number;
  dish: IProduct;
}

export interface IOrder {
  id: number;
  userId: number;
  status: number;
  deliveryFee: number;
  createdAt: string;
  updatedAt: string;
  items: IOrderItem[];
}
