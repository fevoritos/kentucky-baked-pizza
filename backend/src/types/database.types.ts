export interface Role {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  address: string;
  phone: string;
  role: number;
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
}

export interface Ingredient {
  id: number;
  name: string;
}

export interface DishIngredient {
  dishId: number;
  ingredientId: number;
}

export interface Status {
  id: number;
  name: string;
}

export interface Order {
  id: number;
  userId: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  orderId: number;
  dishId: number;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userId: number;
}

export interface CartItem {
  cartId: number;
  dishId: number;
  quantity: number;
}

export interface Feedback {
  id: number;
  value: number;
  userId: number;
  dishId: number;
  createdAt?: Date;
}

export interface UserWithRole extends User {
  roleDetails: Role;
}

export interface DishWithIngredients extends Dish {
  ingredients: Ingredient[];
}

export interface OrderWithItems extends Order {
  items: OrderItemWithDish[];
  user: User;
}

export interface CartWithItems extends Cart {
  items: CartItemWithDish[];
  user: User;
}

export interface OrderItemWithDish extends OrderItem {
  dish: Dish;
}

export interface CartItemWithDish extends CartItem {
  dish: Dish;
}

export interface FeedbackWithUser extends Feedback {
  user: User;
}

export interface FeedbackWithDish extends Feedback {
  dish: Dish;
}

export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}
