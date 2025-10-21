import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Ingredient } from '../types/database.types';

@Injectable()
export class IngredientRepository extends BaseRepository<Ingredient> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return 'ingredient';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): Ingredient {
    return {
      id: Number(row.id),
      name: String(row.name),
    };
  }

  protected mapEntityToRow(entity: Partial<Ingredient>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.name !== undefined) row.name = entity.name;
    return row;
  }

  /**
   * Find ingredient by name (case insensitive)
   */
  async findByName(name: string): Promise<Ingredient | null> {
    const query = `SELECT * FROM ingredient WHERE LOWER(name) = LOWER($1)`;
    const result = await this.databaseService.query(query, [name]);
    return result.rows.length > 0
      ? this.mapRowToEntity(result.rows[0] as Record<string, any>)
      : null;
  }

  /**
   * Search ingredients by name
   */
  async searchByName(name: string): Promise<Ingredient[]> {
    const query = `
      SELECT * FROM ingredient 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name
    `;
    const result = await this.databaseService.query(query, [`%${name}%`]);
    return result.rows.map((row) => this.mapRowToEntity(row as Record<string, any>));
  }
}
