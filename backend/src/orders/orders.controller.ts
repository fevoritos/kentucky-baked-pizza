import { Controller, Get, Post, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { User } from '../types/database.types';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Оформить заказ из текущей корзины' })
  @ApiResponse({ status: 201, description: 'Заказ успешно оформлен' })
  @ApiResponse({ status: 400, description: 'Корзина пуста' })
  async checkout(@Request() req: { user: User }) {
    return this.ordersService.checkout(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список заказов текущего пользователя' })
  @ApiResponse({ status: 200, description: 'Список заказов' })
  async getUserOrders(@Request() req: { user: User }) {
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о конкретном заказе' })
  @ApiResponse({ status: 200, description: 'Информация о заказе' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  async getOrder(@Request() req: { user: User }, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(req.user.id, id);
  }
}
