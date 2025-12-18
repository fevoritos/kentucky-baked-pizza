import type { IProduct } from './product.interface';

export interface ICartItem {
  cartId: number;
  dishId: number;
  quantity: number;
  dish: IProduct;
}

export interface ICart {
  id: number;
  userId: number;
  items: ICartItem[];
}
