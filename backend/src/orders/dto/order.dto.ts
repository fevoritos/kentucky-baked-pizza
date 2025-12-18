import { ApiProperty } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 2, description: 'ID статуса заказа' })
  statusId: number;
}
