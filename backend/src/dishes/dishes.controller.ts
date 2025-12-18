import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  NotFoundException,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DishRepository } from '../repositories/dish.repository';
import { DishesService } from './dishes.service';
import { CreateDishDto, UpdateDishDto } from './dto/dish.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DishWithIngredientNames } from '../types/database.types';

@ApiTags('Dishes')
@Controller('dishes')
export class DishesController {
  constructor(
    private readonly dishRepository: DishRepository,
    private readonly dishesService: DishesService,
  ) {}

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
  async getDishes(@Query('name') name?: string): Promise<DishWithIngredientNames[]> {
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
  async getDishById(@Param('id') id: string): Promise<DishWithIngredientNames> {
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

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Создать новое блюдо (Admin only)' })
  @ApiResponse({ status: 201, description: 'Блюдо успешно создано' })
  async createDish(@Body() createDishDto: CreateDishDto): Promise<DishWithIngredientNames | null> {
    return this.dishesService.create(createDishDto);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Обновить блюдо (Admin only)' })
  @ApiResponse({ status: 200, description: 'Блюдо успешно обновлено' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  async updateDish(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDishDto: UpdateDishDto,
  ): Promise<DishWithIngredientNames | null> {
    return this.dishesService.update(id, updateDishDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить блюдо (Admin only)' })
  @ApiResponse({ status: 200, description: 'Блюдо успешно удалено' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  async deleteDish(@Param('id', ParseIntPipe) id: number) {
    await this.dishesService.delete(id);
    return { message: 'Dish deleted successfully' };
  }
}
