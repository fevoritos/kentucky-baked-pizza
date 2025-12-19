import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 2, description: 'ID статуса заказа' })
  @IsNumber()
  statusId: number;
}

export class CheckoutDto {
  @ApiProperty({ example: 'Москва, ул. Пушкина, д. 1, кв. 10', description: 'Адрес доставки' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '+79001112233', description: 'Номер телефона' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}
