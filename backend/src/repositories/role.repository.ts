import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Role } from '../types/database.types';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return 'role';
  }

  protected getPrimaryKey(): string {
    return 'name';
  }

  protected mapRowToEntity(row: Record<string, any>): Role {
    return {
      name: String(row.name),
    };
  }

  protected mapEntityToRow(entity: Partial<Role>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.name !== undefined) row.name = entity.name;
    return row;
  }

  /**
   * Find role by name
   */
  async findByName(name: string): Promise<Role | null> {
    return this.findOneBy({ name });
  }
}
