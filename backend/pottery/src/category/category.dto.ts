import { Expose, Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class CreateCategoryDto {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateCategoryDto {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsOptional()
    @IsString()
    description?: string;
}

export class CategoryResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    description?: string;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListCategoryRequestDto {
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