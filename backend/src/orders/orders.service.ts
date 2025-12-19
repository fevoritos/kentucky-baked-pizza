import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../repositories/cart.repository';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly cartRepository: CartRepository,
  ) {}

  async checkout(userId: number, address: string, phone: string) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const orderId = await this.cartRepository.convertToOrder(cart.id, address, phone);
    if (!orderId) {
      throw new BadRequestException('Cannot create order from an empty cart');
    }

    return this.orderRepository.findByIdWithItems(orderId);
  }

  async getUserOrders(userId: number) {
    const orders = await this.orderRepository.findByUserId(userId);
    // Sort by creation date descending
    return orders.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getOrderById(userId: number, orderId: number) {
    const order = await this.orderRepository.findByIdWithItems(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async getAllOrders() {
    return this.orderRepository.findAllWithDetails();
  }

  async updateStatus(orderId: number, statusId: number) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return this.orderRepository.updateStatus(orderId, statusId);
  }
}
