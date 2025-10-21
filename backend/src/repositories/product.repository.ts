import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Product, ProductWithIngredients, Ingredient } from '../types/database.types';

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
   * Find product with ingredients
   */
  async findByIdWithIngredients(id: number): Promise<ProductWithIngredients | null> {
    const productQuery = `SELECT * FROM product WHERE id = $1`;
    const productResult = await this.databaseService.query(productQuery, [id]);

    if (productResult.rows.length === 0) return null;

    const product = this.mapRowToEntity(productResult.rows[0] as Record<string, any>);

    const ingredientsQuery = `
      SELECT i.*
      FROM ingredient i
      JOIN product_ingredient pi ON i.id = pi.ingredient_id
      WHERE pi.product_id = $1
      ORDER BY i.name
    `;
    const ingredientsResult = await this.databaseService.query(ingredientsQuery, [id]);

    const ingredients: Ingredient[] = ingredientsResult.rows.map((row: Record<string, any>) => ({
      id: Number(row.id),
      name: String(row.name),
    }));

    return {
      ...product,
      ingredients,
    };
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
}
