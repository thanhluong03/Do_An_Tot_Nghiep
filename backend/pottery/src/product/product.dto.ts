import { Expose, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class ProductImageDto {
  @Expose()
  image_data: Buffer;
}

export class CreateProductDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  price?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}

export class UpdateProductDto {
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  price?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  category_id?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];
}

export class ProductResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  description?: string;

  @Expose()
  price?: number;

  @Expose()
  category_id?: number;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date | null;

  @Expose()
  images?: any[];

  @Expose()
  main_image?: any;
}

export class ListProductRequestDto {
  @Expose({ name: 'page' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number

  @Expose({ name: 'size' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  size?: number

  @Expose({ name: 'key' })
  @IsOptional()
  @IsString()
  key?: string
}