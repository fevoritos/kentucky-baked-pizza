import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FeedbackRepository } from '../repositories/feedback.repository';
import { OrderRepository } from '../repositories/order.repository';
import { DishRepository } from '../repositories/dish.repository';
import { SubmitRatingDto } from './dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepository: FeedbackRepository,
    private readonly orderRepository: OrderRepository,
    private readonly dishRepository: DishRepository,
  ) {}

  async submitRating(userId: number, dto: SubmitRatingDto) {
    const { dishId, rating } = dto;

    // Check if dish exists
    const dish = await this.dishRepository.findById(dishId);
    if (!dish) {
      throw new NotFoundException('Dish not found');
    }

    // Check if user has ordered this dish
    const hasOrdered = await this.orderRepository.hasUserOrderedDish(userId, dishId);
    if (!hasOrdered) {
      throw new ForbiddenException('You can only rate dishes you have ordered');
    }

    // Submit or update rating
    await this.feedbackRepository.upsert({
      userId,
      dishId,
      value: rating,
    });

    // Recalculate average rating for the dish
    await this.updateDishAverageRating(dishId);

    return { message: 'Rating submitted successfully' };
  }

  private async updateDishAverageRating(dishId: number) {
    const feedbacks = await this.feedbackRepository.findByDishId(dishId);
    if (feedbacks.length === 0) return;

    const total = feedbacks.reduce((acc, f) => acc + f.value, 0);
    const average = total / feedbacks.length;

    // Round to 1 decimal place
    const roundedAverage = Math.round(average * 10) / 10;

    await this.dishRepository.updateRating(dishId, roundedAverage);
  }

  async getUserRating(userId: number, dishId: number) {
    return this.feedbackRepository.findByUserAndDish(userId, dishId);
  }
}
