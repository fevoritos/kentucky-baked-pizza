import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { UserRepository } from './repositories/user.repository';
import { DishRepository } from './repositories/dish.repository';

@Injectable()
export class AppService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly userRepository: UserRepository,
    private readonly dishRepository: DishRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getDatabaseInfo(): Promise<{
    isConnected: boolean;
    stats: any;
    userCount: number;
    dishCount: number;
  }> {
    const isConnected = await this.databaseService.isConnected();
    const stats = await this.databaseService.getStats();
    const userCount = await this.userRepository.count();
    const dishCount = await this.dishRepository.count();

    return {
      isConnected,
      stats,
      userCount,
      dishCount,
    };
  }
}
