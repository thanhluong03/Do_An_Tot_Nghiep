import { Expose } from 'class-transformer'
import {
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
} from 'class-validator'

export class CreateProductDto {
  @Expose()
  @IsString()
  name: string

  @Expose()
  @IsOptional()
  @IsString()
  description?: string

  @Expose()
  @IsOptional()
  @IsNumber()
  price?: number

  @Expose()
  @IsOptional()
  @IsNumber()
  quantity?: number

  @Expose()
  @IsOptional()
  @IsString()
  image_url?: string

  @Expose()
  @IsNumber()
  supplier_id: number
}

export class UpdateProductDto {
  @Expose()
  @IsOptional()
  @IsString()
  name?: string

  @Expose()
  @IsOptional()
  @IsString()
  description?: string

  @Expose()
  @IsOptional()
  @IsNumber()
  price?: number

  @Expose()
  @IsOptional()
  @IsNumber()
  quantity?: number

  @Expose()
  @IsOptional()
  @IsString()
  image_url?: string

  @Expose()
  @IsOptional()
  @IsNumber()
  supplier_id?: number
}

export class ProductResponseDto {
  @Expose()
  id: number

  @Expose()
  name: string

  @Expose()
  description?: string

  @Expose()
  price?: number

  @Expose()
  quantity?: number

  @Expose()
  image_url?: string

  @Expose()
  supplier_id: number

  @Expose()
  created_at: Date

  @Expose()
  updated_at: Date | null
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