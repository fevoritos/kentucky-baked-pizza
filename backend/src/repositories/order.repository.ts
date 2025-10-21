import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Order, OrderWithItems, OrderItemWithProduct } from '../types/database.types';

@Injectable()
export class OrderRepository extends BaseRepository<Order> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return '"order"';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): Order {
    return {
      id: Number(row.id),
      userId: Number(row.user_id),
    };
  }

  protected mapEntityToRow(entity: Partial<Order>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.userId !== undefined) row.user_id = entity.userId;
    return row;
  }

  /**
   * Find orders by user ID
   */
  async findByUserId(userId: number): Promise<Order[]> {
    return this.findBy({ user_id: userId });
  }

  /**
   * Find order with items
   */
  async findByIdWithItems(id: number): Promise<OrderWithItems | null> {
    const orderQuery = `SELECT * FROM "order" WHERE id = $1`;
    const orderResult = await this.databaseService.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) return null;

    const order = this.mapRowToEntity(orderResult.rows[0]);

    // Get user info
    const userQuery = `SELECT * FROM "user" WHERE id = $1`;
    const userResult = await this.databaseService.query(userQuery, [order.userId]);
    const user = userResult.rows[0];

    // Get order items
    const itemsQuery = `
      SELECT oi.*, p.name as product_name, p.price as product_price, p.image as product_image, p.rating as product_rating
      FROM order_item oi
      JOIN product p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      ORDER BY p.name
    `;
    const itemsResult = await this.databaseService.query(itemsQuery, [id]);

    const items: OrderItemWithProduct[] = itemsResult.rows.map((row) => ({
      orderId: row.order_id,
      productId: row.product_id,
      count: row.count,
      product: {
        id: row.product_id,
        name: row.product_name,
        price: parseFloat(row.product_price),
        image: row.product_image,
        rating: parseFloat(row.product_rating),
      },
    }));

    return {
      ...order,
      items: items.map((item) => ({
        orderId: item.orderId,
        productId: item.productId,
        count: item.count,
      })),
      user: {
        id: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        name: user.name,
        address: user.address,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  /**
   * Create order with items
   */
  async createWithItems(
    userId: number,
    items: Array<{ productId: number; count: number }>,
  ): Promise<OrderWithItems> {
    return await this.databaseService.transaction(async (client) => {
      // Create order
      const orderQuery = `INSERT INTO "order" (user_id) VALUES ($1) RETURNING *`;
      const orderResult = await client.query(orderQuery, [userId]);
      const order = this.mapRowToEntity(orderResult.rows[0]);

      // Create order items
      for (const item of items) {
        const itemQuery = `
          INSERT INTO order_item (order_id, product_id, count)
          VALUES ($1, $2, $3)
        `;
        await client.query(itemQuery, [order.id, item.productId, item.count]);
      }

      // Return order with items
      const orderWithItems = await this.findByIdWithItems(order.id);
      if (!orderWithItems) {
        throw new Error('Failed to create order with items');
      }
      return orderWithItems;
    });
  }

  /**
   * Add item to order
   */
  async addItem(orderId: number, productId: number, count: number): Promise<boolean> {
    const query = `
      INSERT INTO order_item (order_id, product_id, count)
      VALUES ($1, $2, $3)
      ON CONFLICT (order_id, product_id)
      DO UPDATE SET count = order_item.count + $3
    `;
    const result = await this.databaseService.query(query, [orderId, productId, count]);
    return result.rowCount > 0;
  }

  /**
   * Remove item from order
   */
  async removeItem(orderId: number, productId: number): Promise<boolean> {
    const query = `
      DELETE FROM order_item
      WHERE order_id = $1 AND product_id = $2
    `;
    const result = await this.databaseService.query(query, [orderId, productId]);
    return result.rowCount > 0;
  }

  /**
   * Update item count in order
   */
  async updateItemCount(orderId: number, productId: number, count: number): Promise<boolean> {
    const query = `
      UPDATE order_item
      SET count = $1
      WHERE order_id = $2 AND product_id = $3
    `;
    const result = await this.databaseService.query(query, [count, orderId, productId]);
    return result.rowCount > 0;
  }

  /**
   * Get order total
   */
  async getOrderTotal(orderId: number): Promise<number> {
    const query = `
      SELECT SUM(p.price * oi.count) as total
      FROM order_item oi
      JOIN product p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;
    const result = await this.databaseService.query(query, [orderId]);
    return parseFloat(result.rows[0]?.total || '0');
  }
}
