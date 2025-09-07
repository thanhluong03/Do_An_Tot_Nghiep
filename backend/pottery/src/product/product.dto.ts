
import { Expose } from 'class-transformer'
import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsPositive,
} from 'class-validator'

export class CreateProductDto {
  @Expose()
  @IsString()
  email: string

  @Expose()
  @IsOptional()
  @IsString()
  password?: string

  
}

export class UpdateProductDto {
  @Expose()
  @IsOptional()
  @IsString()
  email?: string

  @Expose()
  @IsOptional()
  @IsString()
  password?: string

  
  
}

export class ProductResponseDto {
  @Expose()
  id: number

  @Expose()
  email: string

  

  @Expose()
  created_at: Date

  @Expose()
  updated_at: Date
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