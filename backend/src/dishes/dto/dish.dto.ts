import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, Min } from 'class-validator';

export class CreateDishDto {
  @ApiProperty({ example: 'Наслаждение' })
  @IsString()
  name: string;

  @ApiProperty({ example: 300 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'https://example.com/image.png' })
  @IsString()
  image: string;

  @ApiProperty({ example: ['салями', 'руккола'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];
}

export class UpdateDishDto {
  @ApiProperty({ example: 'Наслаждение', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 300, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 'https://example.com/image.png', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: ['салями', 'руккола'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];
}
