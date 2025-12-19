import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID блюда',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  dishId: number;

  @ApiProperty({
    description: 'Количество блюда',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'ID блюда',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  dishId: number;

  @ApiProperty({
    description: 'Новое количество блюда',
    example: 2,
  })
  @IsNumber()
  @Min(0)
  quantity: number;
}
