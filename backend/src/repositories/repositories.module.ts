import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { RoleRepository } from './role.repository';
import { ProductRepository } from './product.repository';
import { IngredientRepository } from './ingredient.repository';
import { OrderRepository } from './order.repository';
import { CartRepository } from './cart.repository';

@Module({
  providers: [
    UserRepository,
    RoleRepository,
    ProductRepository,
    IngredientRepository,
    OrderRepository,
    CartRepository,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    ProductRepository,
    IngredientRepository,
    OrderRepository,
    CartRepository,
  ],
})
export class RepositoriesModule {}
