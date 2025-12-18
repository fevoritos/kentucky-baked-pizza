import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { User } from '../types/database.types';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateOrderStatusDto } from './dto/order.dto';

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

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Получить все заказы (Admin only)' })
  @ApiResponse({ status: 200, description: 'Список всех заказов' })
  async getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить информацию о конкретном заказе' })
  @ApiResponse({ status: 200, description: 'Информация о заказе' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  async getOrder(@Request() req: { user: User }, @Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(req.user.id, id);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Изменить статус заказа (Admin only)' })
  @ApiResponse({ status: 200, description: 'Статус заказа обновлен' })
  @ApiResponse({ status: 404, description: 'Заказ не найден' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto.statusId);
  }
}
