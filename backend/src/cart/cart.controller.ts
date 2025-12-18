import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { User } from '../types/database.types';

@ApiTags('Cart')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Получить корзину текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Корзина пользователя' })
  async getCart(@Request() req: { user: User }) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add')
  @ApiOperation({ summary: 'Добавить блюдо в корзину' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Блюдо добавлено в корзину' })
  async addToCart(@Request() req: { user: User }, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Patch('quantity')
  @ApiOperation({ summary: 'Изменить количество блюда в корзине' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Количество блюда обновлено' })
  async updateQuantity(@Request() req: { user: User }, @Body() updateDto: UpdateCartItemDto) {
    return this.cartService.updateQuantity(req.user.id, updateDto);
  }

  @Delete('remove/:dishId')
  @ApiOperation({ summary: 'Удалить блюдо из корзины' })
  @ApiResponse({ status: 200, description: 'Блюдо удалено из корзины' })
  async removeFromCart(
    @Request() req: { user: User },
    @Param('dishId', ParseIntPipe) dishId: number,
  ) {
    return this.cartService.removeFromCart(req.user.id, dishId);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Очистить корзину' })
  @ApiResponse({ status: 200, description: 'Корзина очищена' })
  async clearCart(@Request() req: { user: User }) {
    return this.cartService.clearCart(req.user.id);
  }
}
