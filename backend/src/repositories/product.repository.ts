import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Product } from '../types/database.types';

@Injectable()
export class ProductRepository extends BaseRepository<Product> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return 'product';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): Product {
    return {
      id: Number(row.id),
      name: String(row.name),
      price: Number(row.price),
      image: String(row.image),
      rating: Number(row.rating),
    };
  }

  protected mapEntityToRow(entity: Partial<Product>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.name !== undefined) row.name = entity.name;
    if (entity.price !== undefined) row.price = entity.price;
    if (entity.image !== undefined) row.image = entity.image;
    if (entity.rating !== undefined) row.rating = entity.rating;
    return row;
  }

  /**
   * Find products by name (case insensitive)
   */
  async findByName(name: string): Promise<Product[]> {
    const query = `
      SELECT * FROM product 
      WHERE LOWER(name) LIKE LOWER($1)
      ORDER BY name
    `;
    const result = await this.databaseService.query(query, [`%${name}%`]);
    return result.rows.map((row) => this.mapRowToEntity(row as Record<string, any>));
  }

  /**
   * Find products by price range
   */
  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
    const query = `
      SELECT * FROM product 
      WHERE price BETWEEN $1 AND $2
      ORDER BY price
    `;
    const result = await this.databaseService.query(query, [minPrice, maxPrice]);
    return result.rows.map((row) => this.mapRowToEntity(row as Record<string, any>));
  }

  /**
   * Find products by rating
   */
  async findByMinRating(minRating: number): Promise<Product[]> {
    const query = `
      SELECT * FROM product 
      WHERE rating >= $1
      ORDER BY rating DESC
    `;
    const result = await this.databaseService.query(query, [minRating]);
    return result.rows.map((row) => this.mapRowToEntity(row as Record<string, any>));
  }

  /**
   * Add ingredient to product
   */
  async addIngredient(productId: number, ingredientId: number): Promise<boolean> {
    const query = `
      INSERT INTO product_ingredient (product_id, ingredient_id)
      VALUES ($1, $2)
      ON CONFLICT (product_id, ingredient_id) DO NOTHING
    `;
    const result = await this.databaseService.query(query, [productId, ingredientId]);
    return result.rowCount > 0;
  }

  /**
   * Remove ingredient from product
   */
  async removeIngredient(productId: number, ingredientId: number): Promise<boolean> {
    const query = `
      DELETE FROM product_ingredient
      WHERE product_id = $1 AND ingredient_id = $2
    `;
    const result = await this.databaseService.query(query, [productId, ingredientId]);
    return result.rowCount > 0;
  }

  /**
   * Update product rating
   */
  async updateRating(id: number, rating: number): Promise<boolean> {
    const query = `
      UPDATE product
      SET rating = $1
      WHERE id = $2
    `;
    const result = await this.databaseService.query(query, [rating, id]);
    return result.rowCount > 0;
  }

  /**
   * Find all products with ingredients
   */
  async findAllWithIngredients(): Promise<any[]> {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image,
        p.rating,
        COALESCE(
          JSON_AGG(i.name ORDER BY i.name) FILTER (WHERE i.name IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM product p
      LEFT JOIN product_ingredient pi ON p.id = pi.product_id
      LEFT JOIN ingredient i ON pi.ingredient_id = i.id
      GROUP BY p.id, p.name, p.price, p.image, p.rating
      ORDER BY p.id
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

  /**
   * Find product by ID with ingredients
   */
  async findByIdWithIngredients(id: number): Promise<any> {
    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image,
        p.rating,
        COALESCE(
          JSON_AGG(i.name ORDER BY i.name) FILTER (WHERE i.name IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM product p
      LEFT JOIN product_ingredient pi ON p.id = pi.product_id
      LEFT JOIN ingredient i ON pi.ingredient_id = i.id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.price, p.image, p.rating
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

  /**
   * Search products by name or ingredients
   */
  async searchProducts(searchTerm: string): Promise<any[]> {
    const searchWords = searchTerm.split(/\s+/).filter((word) => word.length > 0);

    if (searchWords.length === 0) {
      return this.findAllWithIngredients();
    }

    const nameConditions = searchWords
      .map((_, index) => `LOWER(p.name) LIKE LOWER($${index + 1})`)
      .join(' AND ');

    const ingredientConditions = searchWords
      .map(
        (_, index) =>
          `EXISTS (
        SELECT 1 
        FROM product_ingredient pi2 
        JOIN ingredient i2 ON pi2.ingredient_id = i2.id 
        WHERE pi2.product_id = p.id 
        AND LOWER(i2.name) LIKE LOWER($${index + 1})
      )`,
      )
      .join(' AND ');

    const query = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image,
        p.rating,
        COALESCE(
          JSON_AGG(i.name ORDER BY i.name) FILTER (WHERE i.name IS NOT NULL),
          '[]'::json
        ) as ingredients
      FROM product p
      LEFT JOIN product_ingredient pi ON p.id = pi.product_id
      LEFT JOIN ingredient i ON pi.ingredient_id = i.id
      WHERE 
        (${nameConditions}) 
        OR (${ingredientConditions})
      GROUP BY p.id, p.name, p.price, p.image, p.rating
      ORDER BY p.name
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
