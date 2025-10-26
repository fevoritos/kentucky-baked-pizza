import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [ProductsController],
})
export class ProductsModule { }
