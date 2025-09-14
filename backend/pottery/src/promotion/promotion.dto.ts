import { Expose, Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsArray,
    ValidateNested,
    IsDate,
    IsBoolean,
} from 'class-validator';

export class CreatePromotionDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    name: string;

    @Expose()
    @IsOptional()
    @IsString()
    description?: string;

    @Expose()
    @IsOptional()
    @IsString()
    discount_type?: string;

    @Expose()
    @IsOptional()
    @IsPositive()
    discount_value?: number;

    @Expose()
    @IsOptional()
    @IsDate()
    start_date?: Date;

    @Expose()
    @IsOptional()
    @IsDate()
    end_date?: Date;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdatePromotionDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    name: string;

    @Expose()
    @IsOptional()
    @IsString()
    description?: string;

    @Expose()
    @IsOptional()
    @IsString()
    discount_type?: string;

    @Expose()
    @IsOptional()
    @IsPositive()
    discount_value?: number;

    @Expose()
    @IsOptional()
    @IsDate()
    start_date?: Date;

    @Expose()
    @IsOptional()
    @IsDate()
    end_date?: Date;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class PromotionResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    description?: string;

    @Expose()
    discount_type?: string;

    @Expose()
    discount_value?: number;

    @Expose()
    start_date?: Date;

    @Expose()
    end_date?: Date;

    @Expose()
    is_active?: boolean;

    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListPromotionRequestDto {
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