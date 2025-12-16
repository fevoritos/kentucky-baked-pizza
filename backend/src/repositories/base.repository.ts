import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

type DatabaseRow = Record<string, any>;

@Injectable()
export abstract class BaseRepository<T> {
  constructor(protected readonly databaseService: DatabaseService) {}

  protected abstract getTableName(): string;

  protected abstract getPrimaryKey(): string;

  protected abstract mapRowToEntity(row: DatabaseRow): T;

  protected abstract mapEntityToRow(entity: Partial<T>): Record<string, any>;

  async findAll(): Promise<T[]> {
    const query = `SELECT * FROM ${this.getTableName()}`;
    const result = await this.databaseService.query(query);
    return result.rows.map((row) => this.mapRowToEntity(row as DatabaseRow));
  }

  async findById(id: number): Promise<T | null> {
    const query = `SELECT * FROM ${this.getTableName()} WHERE ${this.getPrimaryKey()} = $1`;
    const result = await this.databaseService.query(query, [id]);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0] as DatabaseRow) : null;
  }

  async findBy(condition: Record<string, any>): Promise<T[]> {
    const keys = Object.keys(condition);
    const values = Object.values(condition);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

    const query = `SELECT * FROM ${this.getTableName()} WHERE ${whereClause}`;
    const result = await this.databaseService.query(query, values);
    return result.rows.map((row) => this.mapRowToEntity(row as DatabaseRow));
  }

  async findOneBy(condition: Record<string, any>): Promise<T | null> {
    const keys = Object.keys(condition);
    const values = Object.values(condition);
    const whereClause = keys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');

    const query = `SELECT * FROM ${this.getTableName()} WHERE ${whereClause} LIMIT 1`;
    const result = await this.databaseService.query(query, values);
    return result.rows.length > 0 ? this.mapRowToEntity(result.rows[0] as DatabaseRow) : null;
  }

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

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM ${this.getTableName()} WHERE ${this.getPrimaryKey()} = $1`;
    const result = await this.databaseService.query(query, [id]);
    return result.rowCount > 0;
  }

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

  async exists(id: number): Promise<boolean> {
    const query = `SELECT 1 FROM ${this.getTableName()} WHERE ${this.getPrimaryKey()} = $1 LIMIT 1`;
    const result = await this.databaseService.query(query, [id]);
    return result.rows.length > 0;
  }
}
