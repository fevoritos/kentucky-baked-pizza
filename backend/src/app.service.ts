import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';

@Injectable()
export class AppService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly userRepository: UserRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Example method to demonstrate database usage
   */
  async getDatabaseInfo(): Promise<{
    isConnected: boolean;
    stats: any;
    userCount: number;
    productCount: number;
  }> {
    const isConnected = await this.databaseService.isConnected();
    const stats = await this.databaseService.getStats();
    const userCount = await this.userRepository.count();
    const productCount = await this.productRepository.count();

    return {
      isConnected,
      stats,
      userCount,
      productCount,
    };
  }
}
