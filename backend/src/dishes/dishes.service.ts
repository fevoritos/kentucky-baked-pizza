import { Injectable, NotFoundException } from '@nestjs/common';
import { DishRepository } from '../repositories/dish.repository';
import { IngredientRepository } from '../repositories/ingredient.repository';
import { CreateDishDto, UpdateDishDto } from './dto/dish.dto';
import { DishWithIngredientNames } from '../types/database.types';

@Injectable()
export class DishesService {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly ingredientRepository: IngredientRepository,
  ) {}

  async create(createDishDto: CreateDishDto): Promise<DishWithIngredientNames | null> {
    const { ingredients, ...dishData } = createDishDto;

    // 1. Create the dish
    const dish = await this.dishRepository.create(dishData);

    // 2. Handle ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ingredientName of ingredients) {
        let ingredient = await this.ingredientRepository.findByName(ingredientName);
        if (!ingredient) {
          ingredient = await this.ingredientRepository.create({ name: ingredientName });
        }
        await this.dishRepository.addIngredient(dish.id, ingredient.id);
      }
    }

    const result = (await this.dishRepository.findByIdWithIngredients(
      dish.id,
    )) as DishWithIngredientNames | null;
    return result;
  }

  async update(id: number, updateDishDto: UpdateDishDto): Promise<DishWithIngredientNames | null> {
    const { ingredients, ...dishData } = updateDishDto;

    const existingDish = await this.dishRepository.findById(id);
    if (!existingDish) {
      throw new NotFoundException('Dish not found');
    }

    // 1. Update dish basic data
    if (Object.keys(dishData).length > 0) {
      await this.dishRepository.update(id, dishData);
    }

    // 2. Update ingredients if provided
    if (ingredients !== undefined) {
      // Remove all existing ingredients first
      const currentDish = (await this.dishRepository.findByIdWithIngredients(
        id,
      )) as DishWithIngredientNames | null;
      if (currentDish && currentDish.ingredients) {
        for (const ingName of currentDish.ingredients) {
          const ing = await this.ingredientRepository.findByName(ingName);
          if (ing) {
            await this.dishRepository.removeIngredient(id, ing.id);
          }
        }
      }

      // Add new ones
      for (const ingredientName of ingredients) {
        let ingredient = await this.ingredientRepository.findByName(ingredientName);
        if (!ingredient) {
          ingredient = await this.ingredientRepository.create({ name: ingredientName });
        }
        await this.dishRepository.addIngredient(id, ingredient.id);
      }
    }

    const result = (await this.dishRepository.findByIdWithIngredients(
      id,
    )) as DishWithIngredientNames | null;
    return result;
  }

  async delete(id: number): Promise<boolean> {
    const existingDish = await this.dishRepository.findById(id);
    if (!existingDish) {
      throw new NotFoundException('Dish not found');
    }
    return this.dishRepository.delete(id);
  }
}
