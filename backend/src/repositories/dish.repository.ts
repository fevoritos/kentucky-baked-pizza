import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Dish, DishWithIngredientNames } from '../types/database.types';

@Injectable()
export class DishRepository extends BaseRepository<Dish> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return 'dish';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): Dish {
    return {
      id: Number(row.id),
      name: String(row.name),
      price: Number(row.price),
      image: String(row.image),
      rating: Number(row.rating),
    };
  }

  protected mapEntityToRow(entity: Partial<Dish>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.name !== undefined) row.name = entity.name;
    if (entity.price !== undefined) row.price = entity.price;
    if (entity.image !== undefined) row.image = entity.image;
    if (entity.rating !== undefined) row.rating = entity.rating;
    return row;
  }

  async findByName(name: string): Promise<Dish[]> {
    const query = `
      SELECT * FROM dish 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name
    `;
    const result = await this.databaseService.query(query, [`%${name}%`]);
    return result.rows.map((row) => this.mapRowToEntity(row as Record<string, any>));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Dish[]> {
    const query = `
      SELECT * FROM dish 
      WHERE price BETWEEN $1 AND $2
      ORDER BY price
    `;
    const result = await this.databaseService.query(query, [minPrice, maxPrice]);
    return result.rows.map((row) => this.mapRowToEntity(row as Record<string, any>));
  }

  async findByMinRating(minRating: number): Promise<Dish[]> {
    const query = `
      SELECT * FROM dish 
      WHERE rating >= $1
      ORDER BY rating DESC
    `;
    const result = await this.databaseService.query(query, [minRating]);
    return result.rows.map((row) => this.mapRowToEntity(row as Record<string, any>));
  }

  async addIngredient(dishId: number, ingredientId: number): Promise<boolean> {
    const query = `
      INSERT INTO dish_ingredient (dish_id, ingredient_id)
      VALUES ($1, $2)
      ON CONFLICT (dish_id, ingredient_id) DO NOTHING
    `;
    const result = await this.databaseService.query(query, [dishId, ingredientId]);
    return result.rowCount > 0;
  }

  async removeIngredient(dishId: number, ingredientId: number): Promise<boolean> {
    const query = `
      DELETE FROM dish_ingredient
      WHERE dish_id = $1 AND ingredient_id = $2
    `;
    const result = await this.databaseService.query(query, [dishId, ingredientId]);
    return result.rowCount > 0;
  }

  async updateRating(id: number, rating: number): Promise<boolean> {
    const query = `
      UPDATE dish
      SET rating = $1
      WHERE id = $2
    `;
    const result = await this.databaseService.query(query, [rating, id]);
    return result.rowCount > 0;
  }

  async findAllWithIngredients(): Promise<DishWithIngredientNames[]> {
    const query = `
      SELECT 
        d.id,
        d.name,
        d.price,
        d.image,
        d.rating,
        COALESCE(
          JSON_AGG(i.name ORDER BY i.name) FILTER (WHERE i.name IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM dish d
      LEFT JOIN dish_ingredient di ON d.id = di.dish_id
      LEFT JOIN ingredient i ON di.ingredient_id = i.id
      GROUP BY d.id, d.name, d.price, d.image, d.rating
      ORDER BY d.id
    `;
    const result = await this.databaseService.query(query);

    return result.rows.map((row: Record<string, any>) => ({
      id: Number(row.id),
      name: String(row.name),
      price: Number(row.price),
      image: String(row.image),
      rating: Number(row.rating),
      ingredients: row.ingredients || [],
    }));
  }

  async findByIdWithIngredients(id: number): Promise<DishWithIngredientNames | null> {
    const query = `
      SELECT 
        d.id,
        d.name,
        d.price,
        d.image,
        d.rating,
        COALESCE(
          JSON_AGG(i.name ORDER BY i.name) FILTER (WHERE i.name IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM dish d
      LEFT JOIN dish_ingredient di ON d.id = di.dish_id
      LEFT JOIN ingredient i ON di.ingredient_id = i.id
      WHERE d.id = $1
      GROUP BY d.id, d.name, d.price, d.image, d.rating
    `;
    const result = await this.databaseService.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as Record<string, any>;
    return {
      id: Number(row.id),
      name: String(row.name),
      price: Number(row.price),
      image: String(row.image),
      rating: Number(row.rating),
      ingredients: row.ingredients || [],
    };
  }

  async searchDishes(searchTerm: string): Promise<DishWithIngredientNames[]> {
    const searchWords = searchTerm.split(/\s+/).filter((word) => word.length > 0);

    if (searchWords.length === 0) {
      return this.findAllWithIngredients();
    }

    const nameConditions = searchWords
      .map((_, index) => `LOWER(d.name) LIKE LOWER($${index + 1})`)
      .join(' AND ');

    const ingredientConditions = searchWords
      .map(
        (_, index) =>
          `EXISTS (
        SELECT 1 
        FROM dish_ingredient di2 
        JOIN ingredient i2 ON di2.ingredient_id = i2.id 
        WHERE di2.dish_id = d.id 
        AND LOWER(i2.name) LIKE LOWER($${index + 1})
      )`,
      )
      .join(' AND ');

    const query = `
      SELECT 
        d.id,
        d.name,
        d.price,
        d.image,
        d.rating,
        COALESCE(
          JSON_AGG(i.name ORDER BY i.name) FILTER (WHERE i.name IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM dish d
      LEFT JOIN dish_ingredient di ON d.id = di.dish_id
      LEFT JOIN ingredient i ON di.ingredient_id = i.id
      WHERE 
        (${nameConditions}) 
        OR (${ingredientConditions})
      GROUP BY d.id, d.name, d.price, d.image, d.rating
      ORDER BY d.name
    `;

    const params = searchWords.map((word) => `%${word}%`);
    const result = await this.databaseService.query(query, params);

    return result.rows.map((row: Record<string, any>) => ({
      id: Number(row.id),
      name: String(row.name),
      price: Number(row.price),
      image: String(row.image),
      rating: Number(row.rating),
      ingredients: row.ingredients || [],
    }));
  }
}
