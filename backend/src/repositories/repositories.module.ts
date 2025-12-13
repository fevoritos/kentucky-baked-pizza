import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { RoleRepository } from './role.repository';
import { DishRepository } from './dish.repository';
import { IngredientRepository } from './ingredient.repository';
import { OrderRepository } from './order.repository';
import { CartRepository } from './cart.repository';
import { StatusRepository } from './status.repository';
import { FeedbackRepository } from './feedback.repository';

@Module({
  providers: [
    UserRepository,
    RoleRepository,
    DishRepository,
    IngredientRepository,
    OrderRepository,
    CartRepository,
    StatusRepository,
    FeedbackRepository,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    DishRepository,
    IngredientRepository,
    OrderRepository,
    CartRepository,
    StatusRepository,
    FeedbackRepository,
  ],
})
export class RepositoriesModule {}
