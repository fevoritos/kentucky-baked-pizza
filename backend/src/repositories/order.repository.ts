import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Order, OrderWithItems, OrderItemWithDish } from '../types/database.types';

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
      status: Number(row.status),
      deliveryFee: parseFloat(row.delivery_fee),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  }

  protected mapEntityToRow(entity: Partial<Order>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.userId !== undefined) row.user_id = entity.userId;
    if (entity.status !== undefined) row.status = entity.status;
    if (entity.deliveryFee !== undefined) row.delivery_fee = entity.deliveryFee;
    return row;
  }

  async findByUserId(userId: number): Promise<OrderWithItems[]> {
    const query = `SELECT id FROM "order" WHERE user_id = $1 ORDER BY created_at DESC`;
    const result = await this.databaseService.query(query, [userId]);
    const orders: OrderWithItems[] = [];
    for (const row of result.rows) {
      const order = await this.findByIdWithItems(Number(row.id));
      if (order) {
        orders.push(order);
      }
    }
    return orders;
  }

  async findAllWithDetails(): Promise<OrderWithItems[]> {
    const query = `SELECT id FROM "order" ORDER BY created_at DESC`;
    const result = await this.databaseService.query(query);
    const orders: OrderWithItems[] = [];
    for (const row of result.rows) {
      const order = await this.findByIdWithItems(Number(row.id));
      if (order) {
        orders.push(order);
      }
    }
    return orders;
  }

  async findByIdWithItems(id: number): Promise<OrderWithItems | null> {
    const orderQuery = `SELECT * FROM "order" WHERE id = $1`;
    const orderResult = await this.databaseService.query(orderQuery, [id]);

    if (orderResult.rows.length === 0) return null;

    const order = this.mapRowToEntity(orderResult.rows[0]);

    const userQuery = `SELECT * FROM "user" WHERE id = $1`;
    const userResult = await this.databaseService.query(userQuery, [order.userId]);
    const user = userResult.rows[0];

    const itemsQuery = `
      SELECT oi.*, d.name as dish_name, d.price as dish_price, d.image as dish_image, d.rating as dish_rating
      FROM order_item oi
      JOIN dish d ON oi.dish_id = d.id
      WHERE oi.order_id = $1
      ORDER BY d.name
    `;
    const itemsResult = await this.databaseService.query(itemsQuery, [id]);

    const items: OrderItemWithDish[] = itemsResult.rows.map((row) => ({
      orderId: row.order_id,
      dishId: row.dish_id,
      quantity: Number(row.quantity),
      price: parseFloat(row.price),
      dish: {
        id: row.dish_id,
        name: row.dish_name,
        price: parseFloat(row.dish_price),
        image: row.dish_image,
        rating: parseFloat(row.dish_rating),
      },
    }));

    return {
      ...order,
      items: items,
      user: {
        id: user.id,
        email: user.email,
        passwordHash: user.password_hash,
        name: user.name,
        address: user.address,
        phone: user.phone,
        role: Number(user.role),
      },
    };
  }

  async createWithItems(
    userId: number,
    items: Array<{ dishId: number; quantity: number }>,
    statusId: number = 1,
  ): Promise<OrderWithItems> {
    return await this.databaseService.transaction(async (client) => {
      const dishIds = items.map((item) => item.dishId);
      const dishQuery = `SELECT id, price FROM dish WHERE id = ANY($1::int[])`;
      const dishResult = await client.query(dishQuery, [dishIds]);
      const dishPrices = new Map(
        dishResult.rows.map((row: any) => [Number(row.id), parseFloat(row.price)]),
      );

      const orderQuery = `INSERT INTO "order" (user_id, status) VALUES ($1, $2) RETURNING *`;
      const orderResult = await client.query(orderQuery, [userId, statusId]);
      const order = this.mapRowToEntity(orderResult.rows[0]);

      for (const item of items) {
        const price = dishPrices.get(item.dishId) || 0;
        const itemQuery = `
          INSERT INTO order_item (order_id, dish_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `;
        await client.query(itemQuery, [order.id, item.dishId, item.quantity, price]);
      }

      const orderWithItems = await this.findByIdWithItems(order.id);
      if (!orderWithItems) {
        throw new Error('Failed to create order with items');
      }
      return orderWithItems;
    });
  }

  async addItem(orderId: number, dishId: number, quantity: number): Promise<boolean> {
    const dishQuery = `SELECT price FROM dish WHERE id = $1`;
    const dishResult = await this.databaseService.query(dishQuery, [dishId]);
    if (dishResult.rows.length === 0) return false;
    const price = parseFloat(dishResult.rows[0].price);

    const query = `
      INSERT INTO order_item (order_id, dish_id, quantity, price)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (order_id, dish_id)
      DO UPDATE SET quantity = order_item.quantity + $3
    `;
    const result = await this.databaseService.query(query, [orderId, dishId, quantity, price]);
    return result.rowCount > 0;
  }

  async removeItem(orderId: number, dishId: number): Promise<boolean> {
    const query = `
      DELETE FROM order_item
      WHERE order_id = $1 AND dish_id = $2
    `;
    const result = await this.databaseService.query(query, [orderId, dishId]);
    return result.rowCount > 0;
  }

  async updateItemQuantity(orderId: number, dishId: number, quantity: number): Promise<boolean> {
    const query = `
      UPDATE order_item
      SET quantity = $1
      WHERE order_id = $2 AND dish_id = $3
    `;
    const result = await this.databaseService.query(query, [quantity, orderId, dishId]);
    return result.rowCount > 0;
  }

  async getOrderTotal(orderId: number): Promise<number> {
    const query = `
      SELECT (COALESCE(SUM(oi.price * oi.quantity), 0) + o.delivery_fee) as total
      FROM "order" o
      LEFT JOIN order_item oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id, o.delivery_fee
    `;
    const result = await this.databaseService.query(query, [orderId]);
    return parseFloat(result.rows[0]?.total || '0');
  }

  async updateStatus(orderId: number, statusId: number): Promise<boolean> {
    const query = `
      UPDATE "order"
      SET status = $1
      WHERE id = $2
    `;
    const result = await this.databaseService.query(query, [statusId, orderId]);
    return result.rowCount > 0;
  }

  async hasUserOrderedDish(userId: number, dishId: number): Promise<boolean> {
    const query = `
      SELECT 1 FROM "order" o
      JOIN order_item oi ON o.id = oi.order_id
      WHERE o.user_id = $1 AND oi.dish_id = $2
      LIMIT 1
    `;
    const result = await this.databaseService.query(query, [userId, dishId]);
    return result.rows.length > 0;
  }
}
