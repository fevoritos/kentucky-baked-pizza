// Database types based on the ERD schema

export interface Role {
  name: string;
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  address: string;
  phone: string;
  role: string; // Foreign key to Role.name
}

export interface Product {
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

export interface ProductIngredient {
  productId: number;
  ingredientId: number;
}

export interface Order {
  id: number;
  userId: number;
}

export interface OrderItem {
  orderId: number;
  productId: number;
  count: number;
}

export interface Cart {
  id: number;
  userId: number;
}

export interface CartItem {
  cartId: number;
  productId: number;
  count: number;
}

// Extended types with relations
export interface UserWithRole extends User {
  roleDetails: Role;
}

export interface ProductWithIngredients extends Product {
  ingredients: Ingredient[];
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
  user: User;
}

export interface CartWithItems extends Cart {
  items: CartItem[];
  user: User;
}

export interface OrderItemWithProduct extends OrderItem {
  product: Product;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

// Query result types
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

// Database configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}
