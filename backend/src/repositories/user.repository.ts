import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { User, UserWithRole } from '../types/database.types';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return '"user"';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): User {
    return {
      id: Number(row.id),
      email: String(row.email),
      passwordHash: String(row.password_hash),
      name: String(row.name),
      address: String(row.address),
      phone: String(row.phone),
      role: String(row.role),
    };
  }

  protected mapEntityToRow(entity: Partial<User>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.email !== undefined) row.email = entity.email;
    if (entity.passwordHash !== undefined) row.password_hash = entity.passwordHash;
    if (entity.name !== undefined) row.name = entity.name;
    if (entity.address !== undefined) row.address = entity.address;
    if (entity.phone !== undefined) row.phone = entity.phone;
    if (entity.role !== undefined) row.role = entity.role;
    return row;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOneBy({ email });
  }

  /**
   * Find user with role details
   */
  async findByIdWithRole(id: number): Promise<UserWithRole | null> {
    const query = `
      SELECT u.*, r.name as role_name
      FROM "user" u
      JOIN role r ON u.role = r.name
      WHERE u.id = $1
    `;
    const result = await this.databaseService.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0] as Record<string, any>;
    return {
      id: Number(row.id),
      email: String(row.email),
      passwordHash: String(row.password_hash),
      name: String(row.name),
      address: String(row.address),
      phone: String(row.phone),
      role: String(row.role),
      roleDetails: {
        name: String(row.role_name),
      },
    };
  }

  /**
   * Find all users with role details
   */
  async findAllWithRoles(): Promise<UserWithRole[]> {
    const query = `
      SELECT u.*, r.name as role_name
      FROM "user" u
      JOIN role r ON u.role = r.name
      ORDER BY u.id
    `;
    const result = await this.databaseService.query(query);

    return result.rows.map((row: Record<string, any>) => ({
      id: Number(row.id),
      email: String(row.email),
      passwordHash: String(row.password_hash),
      name: String(row.name),
      address: String(row.address),
      phone: String(row.phone),
      role: String(row.role),
      roleDetails: {
        name: String(row.role_name),
      },
    }));
  }

  /**
   * Update user password
   */
  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    const query = `
      UPDATE "user"
      SET password_hash = $1
      WHERE id = $2
    `;
    const result = await this.databaseService.query(query, [passwordHash, id]);
    return result.rowCount > 0;
  }
}
