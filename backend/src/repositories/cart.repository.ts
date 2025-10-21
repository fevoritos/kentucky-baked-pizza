import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Cart, CartWithItems, CartItemWithProduct } from '../types/database.types';

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

  /**
   * Find cart by user ID
   */
  async findByUserId(userId: number): Promise<Cart | null> {
    return this.findOneBy({ user_id: userId });
  }

  /**
   * Find or create cart for user
   */
  async findOrCreateByUserId(userId: number): Promise<Cart> {
    let cart = await this.findByUserId(userId);

    if (!cart) {
      cart = await this.create({ userId });
    }

    return cart;
  }

  /**
   * Find cart with items
   */
  async findByIdWithItems(id: number): Promise<CartWithItems | null> {
    const cartQuery = `SELECT * FROM cart WHERE id = $1`;
    const cartResult = await this.databaseService.query(cartQuery, [id]);

    if (cartResult.rows.length === 0) return null;

    const cart = this.mapRowToEntity(cartResult.rows[0] as Record<string, any>);

    // Get user info
    const userQuery = `SELECT * FROM "user" WHERE id = $1`;
    const userResult = await this.databaseService.query(userQuery, [cart.userId]);
    const user = userResult.rows[0] as Record<string, any>;

    // Get cart items
    const itemsQuery = `
      SELECT ci.*, p.name as product_name, p.price as product_price, p.image as product_image, p.rating as product_rating
      FROM cart_item ci
      JOIN product p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY p.name
    `;
    const itemsResult = await this.databaseService.query(itemsQuery, [id]);

    const items: CartItemWithProduct[] = itemsResult.rows.map((row: Record<string, any>) => ({
      cartId: Number(row.cart_id),
      productId: Number(row.product_id),
      count: Number(row.count),
      product: {
        id: Number(row.product_id),
        name: String(row.product_name),
        price: Number(row.product_price),
        image: String(row.product_image),
        rating: Number(row.product_rating),
      },
    }));

    return {
      ...cart,
      items: items.map((item) => ({
        cartId: item.cartId,
        productId: item.productId,
        count: item.count,
      })),
      user: {
        id: Number(user.id),
        email: String(user.email),
        passwordHash: String(user.password_hash),
        name: String(user.name),
        address: String(user.address),
        phone: String(user.phone),
        role: String(user.role),
      },
    };
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: number, productId: number, count: number): Promise<boolean> {
    const query = `
      INSERT INTO cart_item (cart_id, product_id, count)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET count = cart_item.count + $3
    `;
    const result = await this.databaseService.query(query, [cartId, productId, count]);
    return result.rowCount > 0;
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: number, productId: number): Promise<boolean> {
    const query = `
      DELETE FROM cart_item
      WHERE cart_id = $1 AND product_id = $2
    `;
    const result = await this.databaseService.query(query, [cartId, productId]);
    return result.rowCount > 0;
  }

  /**
   * Update item count in cart
   */
  async updateItemCount(cartId: number, productId: number, count: number): Promise<boolean> {
    if (count <= 0) {
      return this.removeItem(cartId, productId);
    }

    const query = `
      UPDATE cart_item
      SET count = $1
      WHERE cart_id = $2 AND product_id = $3
    `;
    const result = await this.databaseService.query(query, [count, cartId, productId]);
    return result.rowCount > 0;
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: number): Promise<boolean> {
    const query = `DELETE FROM cart_item WHERE cart_id = $1`;
    const result = await this.databaseService.query(query, [cartId]);
    return result.rowCount >= 0; // Always return true, even if cart was already empty
  }

  /**
   * Get cart total
   */
  async getCartTotal(cartId: number): Promise<number> {
    const query = `
      SELECT SUM(p.price * ci.count) as total
      FROM cart_item ci
      JOIN product p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `;
    const result = await this.databaseService.query(query, [cartId]);
    return Number((result.rows[0] as Record<string, any>)?.total || '0');
  }

  /**
   * Get cart item count
   */
  async getCartItemCount(cartId: number): Promise<number> {
    const query = `
      SELECT SUM(count) as total_items
      FROM cart_item
      WHERE cart_id = $1
    `;
    const result = await this.databaseService.query(query, [cartId]);
    return Number((result.rows[0] as Record<string, any>)?.total_items || '0');
  }

  /**
   * Convert cart to order
   */
  async convertToOrder(cartId: number): Promise<number | null> {
    return await this.databaseService.transaction(async (client) => {
      // Get cart with items
      const cartQuery = `SELECT * FROM cart WHERE id = $1`;
      const cartResult = await client.query(cartQuery, [cartId]);

      if (cartResult.rows.length === 0) return null;

      const cart = this.mapRowToEntity(cartResult.rows[0] as Record<string, any>);

      // Get cart items
      const itemsQuery = `SELECT * FROM cart_item WHERE cart_id = $1`;
      const itemsResult = await client.query(itemsQuery, [cartId]);

      if (itemsResult.rows.length === 0) return null;

      // Create order
      const orderQuery = `INSERT INTO "order" (user_id) VALUES ($1) RETURNING id`;
      const orderResult = await client.query(orderQuery, [cart.userId]);
      const orderId = Number((orderResult.rows[0] as Record<string, any>).id);

      // Move items from cart to order
      for (const item of itemsResult.rows) {
        const orderItemQuery = `
          INSERT INTO order_item (order_id, product_id, count)
          VALUES ($1, $2, $3)
        `;
        await client.query(orderItemQuery, [
          orderId,
          Number((item as Record<string, any>).product_id),
          Number((item as Record<string, any>).count),
        ]);
      }

      // Clear cart
      await client.query(`DELETE FROM cart_item WHERE cart_id = $1`, [cartId]);

      return orderId;
    });
  }
}
