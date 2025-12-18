import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from '../repositories/cart.repository';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async getCart(userId: number) {
    const cart = await this.cartRepository.findOrCreateByUserId(userId);
    return this.cartRepository.findByIdWithItems(cart.id);
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const cart = await this.cartRepository.findOrCreateByUserId(userId);
    const { dishId, quantity } = addToCartDto;

    // We don't check if dish exists here because the DB foreign key constraint will catch it
    // But for better UX we might want to check it. For now, following simple repo logic.
    await this.cartRepository.addItem(cart.id, dishId, quantity);
    return this.getCart(userId);
  }

  async removeFromCart(userId: number, dishId: number) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.cartRepository.removeItem(cart.id, dishId);
    return this.getCart(userId);
  }

  async updateQuantity(userId: number, updateDto: UpdateCartItemDto) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const { dishId, quantity } = updateDto;
    await this.cartRepository.updateItemQuantity(cart.id, dishId, quantity);
    return this.getCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (cart) {
      await this.cartRepository.clearCart(cart.id);
    }
    return this.getCart(userId);
  }
}
