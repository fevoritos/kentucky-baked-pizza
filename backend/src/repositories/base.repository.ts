import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

// Database row type for safe access
type DatabaseRow = Record<string, any>;

@Injectable()
export abstract class BaseRepository<T> {
  constructor(protected readonly databaseService: DatabaseService) {}

  /**
   * Get table name - must be implemented by child classes
   */
  protected abstract getTableName(): string;

  /**
   * Get primary key column name - must be implemented by child classes
   */
  protected abstract getPrimaryKey(): string;

  /**
   * Map database row to entity - must be implemented by child classes
   */
  protected abstract mapRowToEntity(row: DatabaseRow): T;

  /**
   * Map entity to database row - must be implemented by child classes
   */
  protected abstract mapEntityToRow(entity: Partial<T>): Record<string, any>;

  /**
   * Find all records
   */
  async findAll(): Promise<T[]> {
    const query = `SELECT * FROM ${this.getTableName()}`;
    const result = await this.databaseService.query(query);
    return result.rows.map((row) => this.mapRowToEntity(row as DatabaseRow));
  }

  /**
   * Find record by ID
   */
  async findById(id: number): Promise<T | null> {
    const query = `SELECT * FROM ${this.getTableName()} WHERE ${this.getPrimaryKey()} = $1`;
    const result = await this.databaseService.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0] as DatabaseRow) : null;
  }

  /**
   * Find records by condition
   */
  async findBy(condition: Record<string, any>): Promise<T[]> {
    const keys = Object.keys(condition);
    const values = Object.values(condition);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

    const query = `SELECT * FROM ${this.getTableName()} WHERE ${whereClause}`;
    const result = await this.databaseService.query(query, values);
    return result.rows.map((row) => this.mapRowToEntity(row as DatabaseRow));
  }

  /**
   * Find one record by condition
   */
  async findOneBy(condition: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(condition);
    const values = Object.values(condition);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

    const query = `SELECT * FROM ${this.getTableName()} WHERE ${whereClause} LIMIT 1`;
    const result = await this.databaseService.query(query, values);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0] as DatabaseRow) : null;
  }

  /**
   * Create new record
   */
  async create(entity: Partial<T>): Promise<T> {
    const row: Record<string, any> = this.mapEntityToRow(entity);
    const keys = Object.keys(row);
    const values = Object.values(row);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${this.getTableName()} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.databaseService.query(query, values);
    return this.mapRowToEntity(result.rows[0] as DatabaseRow);
  }

  /**
   * Update record by ID
   */
  async update(id: number, entity: Partial<T>): Promise<T | null> {
    const row: Record<string, any> = this.mapEntityToRow(entity);
    const keys = Object.keys(row);
    const values = Object.values(row);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const query = `
      UPDATE ${this.getTableName()}
      SET ${setClause}
      WHERE ${this.getPrimaryKey()} = $${keys.length + 1}
      RETURNING *
    `;

    const allValues: any[] = [...values, id];
    const result = await this.databaseService.query(query, allValues);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0] as DatabaseRow) : null;
  }

  /**
   * Delete record by ID
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM ${this.getTableName()} WHERE ${this.getPrimaryKey()} = $1`;
    const result = await this.databaseService.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Count records
   */
  async count(condition?: Record<string, any>): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.getTableName()}`;
    let values: any[] = [];

    if (condition) {
      const keys = Object.keys(condition);
      const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
      values = Object.values(condition);
    }

    const result = await this.databaseService.query(query, values);
    return parseInt(String((result.rows[0] as DatabaseRow).count));
  }

  /**
   * Check if record exists
   */
  async exists(id: number): Promise<boolean> {
    const query = `SELECT 1 FROM ${this.getTableName()} WHERE ${this.getPrimaryKey()} = $1 LIMIT 1`;
    const result = await this.databaseService.query(query, [id]);
    return result.rows.length > 0;
  }
}
