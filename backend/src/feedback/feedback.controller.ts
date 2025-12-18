import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { FeedbackService } from './feedback.service';
import { SubmitRatingDto } from './dto/feedback.dto';
import { User } from '../types/database.types';

@ApiTags('Feedback')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'))
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('rate')
  @ApiOperation({ summary: 'Оценить блюдо' })
  @ApiBody({ type: SubmitRatingDto })
  @ApiResponse({ status: 201, description: 'Рейтинг успешно сохранен' })
  @ApiResponse({ status: 403, description: 'Пользователь не заказывал это блюдо' })
  @ApiResponse({ status: 404, description: 'Блюдо не найдено' })
  async rateDish(@Request() req: { user: User }, @Body() dto: SubmitRatingDto) {
    return this.feedbackService.submitRating(req.user.id, dto);
  }

  @Get('my-rating/:dishId')
  @ApiOperation({ summary: 'Получить оценку пользователя для конкретного блюда' })
  @ApiResponse({ status: 200, description: 'Оценка пользователя' })
  async getMyRating(@Request() req: { user: User }, @Param('dishId', ParseIntPipe) dishId: number) {
    return this.feedbackService.getUserRating(req.user.id, dishId);
  }
}
