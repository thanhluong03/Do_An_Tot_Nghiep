import { Expose, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsPositive,
  IsArray,
  ValidateNested,
} from 'class-validator';

export class CreateSupplierDto {
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  address?: string;

  @Expose()
  @IsOptional()
  @IsString()
  phone?: string; // Sửa lại thành string

  @Expose()
  @IsOptional()
  @IsString()
  email?: string; // Sửa lại thành string
}

export class UpdateSupplierDto { // Sửa lại tên class
  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsOptional()
  @IsString()
  address?: string;

  @Expose()
  @IsOptional()
  @IsString()
  phone?: string; // Sửa lại thành string

  @Expose()
  @IsOptional()
  @IsString()
  email?: string; // Sửa lại thành string
}

export class SupplierResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  address?: string;

  @Expose()
  phone?: number;

  @Expose()
  email?: string;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date | null;
}

export class ListSupplierRequestDto {
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