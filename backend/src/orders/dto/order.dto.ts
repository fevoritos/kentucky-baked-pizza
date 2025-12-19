import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 2, description: 'ID статуса заказа' })
  @IsNumber()
  statusId: number;
}
