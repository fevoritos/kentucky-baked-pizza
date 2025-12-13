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
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): Feedback {
    return {
      id: Number(row.id),
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

  /**
   * Find feedback by user ID
   */
  async findByUserId(userId: number): Promise<Feedback[]> {
    return this.findBy({ user_id: userId });
  }

  /**
   * Find feedback by dish ID
   */
  async findByDishId(dishId: number): Promise<Feedback[]> {
    return this.findBy({ dish_id: dishId });
  }

  /**
   * Find feedback by user and dish
   */
  async findByUserAndDish(userId: number, dishId: number): Promise<Feedback | null> {
    return this.findOneBy({ user_id: userId, dish_id: dishId });
  }

  /**
   * Find feedback with user details
   */
  async findByIdWithUser(id: number): Promise<FeedbackWithUser | null> {
    const query = `
      SELECT f.*, u.id as user_id, u.email, u.name as user_name, u.address, u.phone, u.role
      FROM feedback f
      JOIN "user" u ON f.user_id = u.id
      WHERE f.id = $1
    `;
    const result = await this.databaseService.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as Record<string, any>;
    return {
      id: Number(row.id),
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

  /**
   * Find feedback with dish details
   */
  async findByIdWithDish(id: number): Promise<FeedbackWithDish | null> {
    const query = `
      SELECT f.*, d.id as dish_id, d.name as dish_name, d.price, d.image, d.rating
      FROM feedback f
      JOIN dish d ON f.dish_id = d.id
      WHERE f.id = $1
    `;
    const result = await this.databaseService.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as Record<string, any>;
    return {
      id: Number(row.id),
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

  /**
   * Create or update feedback
   */
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
