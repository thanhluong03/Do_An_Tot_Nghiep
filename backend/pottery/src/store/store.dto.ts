import { Expose, Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class CreateStoreDto {
    @Expose()
    @IsString()
    store_name: string;

    @Expose()
    @IsOptional()
    @IsString()
    address?: string;

    @Expose()
    @IsOptional()
    @IsString()
    phone?: string;
}

export class UpdateStoreDto {
    @Expose()
    @IsString()
    store_name: string;

    @Expose()
    @IsOptional()
    @IsString()
    address?: string;

    @Expose()
    @IsOptional()
    @IsString()
    phone?: string;
}

export class StoreResponseDto {
    @Expose()
    id: number;

    @Expose()
    store_name: string;

    @Expose()
    address?: string;

    @Expose()
    phone?: number;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListStoreRequestDto {
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