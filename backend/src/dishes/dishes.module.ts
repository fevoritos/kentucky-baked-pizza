import { Module } from '@nestjs/common';
import { DishesController } from './dishes.controller';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [DishesController],
})
export class DishesModule {}
