import { Expose, Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsArray,
    ValidateNested,
} from 'class-validator';

export class CreateReviewDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    rating: number;

    @Expose()
    @IsOptional()
    @IsString()
    comment?: string;

    @Expose()
    @IsOptional()
    @IsPositive()
    user_id?: number;

    @Expose()
    @IsOptional()
    @IsPositive()
    product_id?: number;
}

export class UpdateReviewDto {
    @Expose()
    @IsNumber()
    rating: number;

    @Expose()
    @IsOptional()
    @IsString()
    comment?: string;

    @Expose()
    @IsPositive()
    @IsNumber()
    user_id?: number;

    @Expose()
    @IsPositive()
    @IsNumber()
    product_id?: number;
}

export class ReviewResponseDto {
    @Expose()
    id: number;

    @Expose()
    rating: number;

    @Expose()
    comment?: string;

    @Expose()
    user_id?: number;

    @Expose()
    product_id?: number;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListReviewRequestDto {
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