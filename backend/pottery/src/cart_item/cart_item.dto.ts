import { Expose, Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class CreateCartItemDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    product_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    customer_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    store_id: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    total_amount?: number;
}

export class UpdateCartItemDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    product_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    customer_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    store_id: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    total_amount?: number;
}

export class CartItemResponseDto {
    @Expose()
    id: number;

    @Expose()
    product_id: number;

    @Expose()
    customer_id: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    total_amount?: number;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListCartItemRequestDto {
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