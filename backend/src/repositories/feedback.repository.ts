import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Feedback, FeedbackWithUser, FeedbackWithDish } from '../types/database.types';

@Injectable()
export class FeedbackRepository extends BaseRepository<Feedback> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return 'feedback';
  }

  protected getPrimaryKey(): string {
    return 'user_id'; // Or some other column, but BaseRepository methods won't be fully compatible
  }

  protected mapRowToEntity(row: Record<string, any>): Feedback {
    return {
      value: Number(row.value),
      userId: Number(row.user_id),
      dishId: Number(row.dish_id),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
    };
  }

  protected mapEntityToRow(entity: Partial<Feedback>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.value !== undefined) row.value = entity.value;
    if (entity.userId !== undefined) row.user_id = entity.userId;
    if (entity.dishId !== undefined) row.dish_id = entity.dishId;
    return row;
  }

  async findByUserId(userId: number): Promise<Feedback[]> {
    return this.findBy({ user_id: userId });
  }

  async findByDishId(dishId: number): Promise<Feedback[]> {
    return this.findBy({ dish_id: dishId });
  }

  async findByUserAndDish(userId: number, dishId: number): Promise<Feedback | null> {
    return this.findOneBy({ user_id: userId, dish_id: dishId });
  }

  async findByIdWithUser(userId: number, dishId: number): Promise<FeedbackWithUser | null> {
    const query = `
      SELECT f.*, u.id as user_id, u.email, u.name as user_name, u.address, u.phone, u.role
      FROM feedback f
      JOIN "user" u ON f.user_id = u.id
      WHERE f.user_id = $1 AND f.dish_id = $2
    `;
    const result = await this.databaseService.query(query, [userId, dishId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as Record<string, any>;
    return {
      value: Number(row.value),
      userId: Number(row.user_id),
      dishId: Number(row.dish_id),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      user: {
        id: Number(row.user_id),
        email: String(row.email),
        passwordHash: '',
        name: String(row.user_name),
        address: String(row.address || ''),
        phone: String(row.phone || ''),
        role: Number(row.role),
      },
    };
  }

  async findByIdWithDish(userId: number, dishId: number): Promise<FeedbackWithDish | null> {
    const query = `
      SELECT f.*, d.id as dish_id, d.name as dish_name, d.price, d.image, d.rating
      FROM feedback f
      JOIN dish d ON f.dish_id = d.id
      WHERE f.user_id = $1 AND f.dish_id = $2
    `;
    const result = await this.databaseService.query(query, [userId, dishId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as Record<string, any>;
    return {
      value: Number(row.value),
      userId: Number(row.user_id),
      dishId: Number(row.dish_id),
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      dish: {
        id: Number(row.dish_id),
        name: String(row.dish_name),
        price: parseFloat(row.price),
        image: String(row.image || ''),
        rating: parseFloat(row.rating),
      },
    };
  }

  async upsert(feedback: Partial<Feedback>): Promise<Feedback> {
    const query = `
      INSERT INTO feedback (user_id, dish_id, value)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, dish_id)
      DO UPDATE SET value = EXCLUDED.value, created_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await this.databaseService.query(query, [
      feedback.userId,
      feedback.dishId,
      feedback.value,
    ]);
    return this.mapRowToEntity(result.rows[0] as Record<string, any>);
  }
}
