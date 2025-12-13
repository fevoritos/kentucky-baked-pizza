import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DishRepository } from '../repositories/dish.repository';

@ApiTags('Dishes')
@Controller('dishes')
export class DishesController {
  constructor(private readonly dishRepository: DishRepository) { }

  @Get()
  @ApiOperation({ summary: 'Получить все блюда или найти блюда по названию/ингредиентам' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: 'string',
    description: 'Поиск по названию блюда или ингредиентам (все слова должны присутствовать)',
  })
  @ApiResponse({
    status: 200,
    description: 'Список блюд с ингредиентами',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Наслаждение' },
          price: { type: 'number', example: 300 },
          ingredients: {
            type: 'array',
            items: {
              type: 'string',
              example: 'салями',
            },
          },
          image: { type: 'string', example: 'https://example.com/image.png' },
          rating: { type: 'number', example: 4.7 },
        },
      },
    },
  })
  async getDishes(@Query('name') name?: string): Promise<any[]> {
    if (name && name.trim()) {
      return this.dishRepository.searchDishes(name.trim());
    }
    return this.dishRepository.findAllWithIngredients();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить блюдо по ID с ингредиентами' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID блюда' })
  @ApiResponse({
    status: 200,
    description: 'Блюдо с ингредиентами',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Наслаждение' },
        price: { type: 'number', example: 300 },
        ingredients: {
          type: 'array',
          items: {
            type: 'string',
            example: 'салями',
          },
        },
        image: { type: 'string', example: 'https://example.com/image.png' },
        rating: { type: 'number', example: 4.7 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  async getDishById(@Param('id') id: string): Promise<any> {
    const dishId = parseInt(id, 10);
    if (isNaN(dishId)) {
      throw new NotFoundException('Неверный ID блюда');
    }

    const dish = await this.dishRepository.findByIdWithIngredients(dishId);
    if (!dish) {
      throw new NotFoundException('Блюдо не найдено');
    }

    return dish;
  }
}
