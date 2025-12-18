import { ApiProperty } from '@nestjs/swagger';

export class CreateDishDto {
  @ApiProperty({ example: 'Наслаждение' })
  name: string;

  @ApiProperty({ example: 300 })
  price: number;

  @ApiProperty({ example: 'https://example.com/image.png' })
  image: string;

  @ApiProperty({ example: ['салями', 'руккола'], type: [String] })
  ingredients: string[];
}

export class UpdateDishDto {
  @ApiProperty({ example: 'Наслаждение', required: false })
  name?: string;

  @ApiProperty({ example: 300, required: false })
  price?: number;

  @ApiProperty({ example: 'https://example.com/image.png', required: false })
  image?: string;

  @ApiProperty({ example: ['салями', 'руккола'], type: [String], required: false })
  ingredients?: string[];
}
