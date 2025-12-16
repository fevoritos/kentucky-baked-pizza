import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Cart, CartWithItems, CartItemWithDish } from '../types/database.types';

@Injectable()
export class CartRepository extends BaseRepository<Cart> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return 'cart';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): Cart {
    return {
      id: Number(row.id),
      userId: Number(row.user_id),
    };
  }

  protected mapEntityToRow(entity: Partial<Cart>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.userId !== undefined) row.user_id = entity.userId;
    return row;
  }

  async findByUserId(userId: number): Promise<Cart | null> {
    return this.findOneBy({ user_id: userId });
  }

  async findOrCreateByUserId(userId: number): Promise<Cart> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      cart = await this.create({ userId });
    }

    return cart;
  }

  async findByIdWithItems(id: number): Promise<CartWithItems | null> {
    const cartQuery = `SELECT * FROM cart WHERE id = $1`;
    const cartResult = await this.databaseService.query(cartQuery, [id]);

    if (cartResult.rows.length === 0) return null;

    const cart = this.mapRowToEntity(cartResult.rows[0] as Record<string, any>);

    const userQuery = `SELECT * FROM "user" WHERE id = $1`;
    const userResult = await this.databaseService.query(userQuery, [cart.userId]);
    const user = userResult.rows[0] as Record<string, any>;

    const itemsQuery = `
      SELECT ci.*, d.name as dish_name, d.price as dish_price, d.image as dish_image, d.rating as dish_rating
      FROM cart_item ci
      JOIN dish d ON ci.dish_id = d.id
      WHERE ci.cart_id = $1
      ORDER BY d.name
    `;
    const itemsResult = await this.databaseService.query(itemsQuery, [id]);

    const items: CartItemWithDish[] = itemsResult.rows.map((row: Record<string, any>) => ({
      cartId: Number(row.cart_id),
      dishId: Number(row.dish_id),
      quantity: Number(row.quantity),
      dish: {
        id: Number(row.dish_id),
        name: String(row.dish_name),
        price: Number(row.dish_price),
        image: String(row.dish_image),
        rating: Number(row.dish_rating),
      },
    }));

    return {
      ...cart,
      items: items.map((item) => ({
        cartId: item.cartId,
        dishId: item.dishId,
        quantity: item.quantity,
      })),
      user: {
        id: Number(user.id),
        email: String(user.email),
        passwordHash: String(user.password_hash),
        name: String(user.name),
        address: String(user.address),
        phone: String(user.phone),
        role: Number(user.role),
      },
    };
  }

  async addItem(cartId: number, dishId: number, quantity: number): Promise<boolean> {
    const query = `
      INSERT INTO cart_item (cart_id, dish_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, dish_id)
      DO UPDATE SET quantity = cart_item.quantity + $3
    `;
    const result = await this.databaseService.query(query, [cartId, dishId, quantity]);
    return result.rowCount > 0;
  }

  async removeItem(cartId: number, dishId: number): Promise<boolean> {
    const query = `
      DELETE FROM cart_item
      WHERE cart_id = $1 AND dish_id = $2
    `;
    const result = await this.databaseService.query(query, [cartId, dishId]);
    return result.rowCount > 0;
  }

  async updateItemQuantity(cartId: number, dishId: number, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      return this.removeItem(cartId, dishId);
    }

    const query = `
      UPDATE cart_item
      SET quantity = $1
      WHERE cart_id = $2 AND dish_id = $3
    `;
    const result = await this.databaseService.query(query, [quantity, cartId, dishId]);
    return result.rowCount > 0;
  }

  async clearCart(cartId: number): Promise<boolean> {
    const query = `DELETE FROM cart_item WHERE cart_id = $1`;
    const result = await this.databaseService.query(query, [cartId]);
    return result.rowCount >= 0; // Always return true, even if cart was already empty
  }

  async getCartTotal(cartId: number): Promise<number> {
    const query = `
      SELECT SUM(d.price * ci.quantity) as total
      FROM cart_item ci
      JOIN dish d ON ci.dish_id = d.id
      WHERE ci.cart_id = $1
    `;
    const result = await this.databaseService.query(query, [cartId]);
    return Number((result.rows[0] as Record<string, any>)?.total || '0');
  }

  async getCartItemCount(cartId: number): Promise<number> {
    const query = `
      SELECT SUM(quantity) as total_items
      FROM cart_item
      WHERE cart_id = $1
    `;
    const result = await this.databaseService.query(query, [cartId]);
    return Number((result.rows[0] as Record<string, any>)?.total_items || '0');
  }

  async convertToOrder(cartId: number): Promise<number | null> {
    return await this.databaseService.transaction(async (client) => {
      const cartQuery = `SELECT * FROM cart WHERE id = $1`;
      const cartResult = await client.query(cartQuery, [cartId]);

      if (cartResult.rows.length === 0) return null;

      const cart = this.mapRowToEntity(cartResult.rows[0] as Record<string, any>);

      const itemsQuery = `SELECT * FROM cart_item WHERE cart_id = $1`;
      const itemsResult = await client.query(itemsQuery, [cartId]);

      if (itemsResult.rows.length === 0) return null;

      const dishIds = itemsResult.rows.map((item: any) => Number(item.dish_id));
      const dishQuery = `SELECT id, price FROM dish WHERE id = ANY($1::int[])`;
      const dishResult = await client.query(dishQuery, [dishIds]);
      const dishPrices = new Map(
        dishResult.rows.map((row: any) => [Number(row.id), parseFloat(row.price)]),
      );

      const orderQuery = `INSERT INTO "order" (user_id, status) VALUES ($1, $2) RETURNING id`;
      const orderResult = await client.query(orderQuery, [cart.userId, 1]);
      const orderId = Number((orderResult.rows[0] as Record<string, any>).id);

      for (const item of itemsResult.rows) {
        const dishId = Number((item as Record<string, any>).dish_id);
        const quantity = Number((item as Record<string, any>).quantity);
        const price = dishPrices.get(dishId) || 0;
        const orderItemQuery = `
          INSERT INTO order_item (order_id, dish_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `;
        await client.query(orderItemQuery, [orderId, dishId, quantity, price]);
      }

      await client.query(`DELETE FROM cart_item WHERE cart_id = $1`, [cartId]);

      return orderId;
    });
  }
}
