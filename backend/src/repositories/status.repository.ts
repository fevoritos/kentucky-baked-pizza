import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { DatabaseService } from '../database/database.service';
import { Status } from '../types/database.types';

@Injectable()
export class StatusRepository extends BaseRepository<Status> {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
  }

  protected getTableName(): string {
    return 'status';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  protected mapRowToEntity(row: Record<string, any>): Status {
    return {
      id: Number(row.id),
      name: String(row.name),
    };
  }

  protected mapEntityToRow(entity: Partial<Status>): Record<string, any> {
    const row: Record<string, any> = {};
    if (entity.id !== undefined) row.id = entity.id;
    if (entity.name !== undefined) row.name = entity.name;
    return row;
  }

  /**
   * Find status by name
   */
  async findByName(name: string): Promise<Status | null> {
    return this.findOneBy({ name });
  }
}
