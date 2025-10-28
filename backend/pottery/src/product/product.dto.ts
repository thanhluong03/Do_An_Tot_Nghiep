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

export class ProductAttributeDto {
  @Expose()
  @IsString()
  name: string;
}

export class ProductClassificationDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes: ProductAttributeDto[];
}

export class ClassificationAttributeRelationshipDto {
  @Expose()
  @IsNumber()
  product_attribute_id_1: number;

  @Expose()
  @IsNumber()
  product_attribute_id_2: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  price?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  quantity?: number;
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
  @IsNumber()
  supplier_id?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductClassificationDto)
  classifications?: ProductClassificationDto[];

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassificationAttributeRelationshipDto)
  relationships?: ClassificationAttributeRelationshipDto[];
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
  @IsNumber()
  supplier_id?: number;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductClassificationDto)
  classifications?: ProductClassificationDto[];

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassificationAttributeRelationshipDto)
  relationships?: ClassificationAttributeRelationshipDto[];

  @Expose()
  @IsOptional()
  @IsString()
  keepImageIndices?: string;

  @Expose()
  @IsOptional()
  @IsString()
  imageOperations?: string;
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
  supplier_id?: number;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date | null;

  @Expose()
  images?: any[];

  @Expose()
  main_image?: any;

  @Expose()
  classifications?: ProductClassificationDto[];

  @Expose()
  relationships?: ClassificationAttributeRelationshipDto[];
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