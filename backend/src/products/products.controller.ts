import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductRepository } from '../repositories/product.repository';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productRepository: ProductRepository) { }

  @Get()
  @ApiOperation({ summary: 'Получить все продукты или найти продукты по названию/ингредиентам' })
  @ApiQuery({
    name: 'name',
    required: false,
    type: 'string',
    description: 'Поиск по названию продукта или ингредиентам (все слова должны присутствовать)',
  })
  @ApiResponse({
    status: 200,
    description: 'Список продуктов с ингредиентами',
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
  async getProducts(@Query('name') name?: string): Promise<any[]> {
    if (name && name.trim()) {
      return this.productRepository.searchProducts(name.trim());
    }
    return this.productRepository.findAllWithIngredients();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить продукт по ID с ингредиентами' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID продукта' })
  @ApiResponse({
    status: 200,
    description: 'Продукт с ингредиентами',
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
  @ApiResponse({ status: 404, description: 'Продукт не найден' })
  async getProductById(@Param('id') id: string): Promise<any> {
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      throw new NotFoundException('Неверный ID продукта');
    }

    const product = await this.productRepository.findByIdWithIngredients(productId);
    if (!product) {
      throw new NotFoundException('Продукт не найден');
    }

    return product;
  }
}
