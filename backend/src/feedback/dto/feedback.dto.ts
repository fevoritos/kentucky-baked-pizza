import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitRatingDto {
  @ApiProperty({
    description: 'ID блюда',
    example: 1,
  })
  @IsNumber()
  dishId: number;

  @ApiProperty({
    description: 'Оценка (от 1 до 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}

