import { Expose, Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsPositive,
    IsDate,
    IsBoolean,
} from 'class-validator';

export class CreateNewsDto {
    @Expose()
    @IsString()
    title: string;

    @Expose()
    @IsOptional()
    @IsString()
    content?: string;

    @Expose()
    @IsOptional()
    @IsDate()
    published_at?: Date;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_published?: boolean;

    @Expose()
    @IsOptional()
    @IsNumber()
    user_id?: number;

}

export class UpdateNewsDto {
    @Expose()
    @IsString()
    title: string;

    @Expose()
    @IsOptional()
    @IsString()
    content?: string;

    @Expose()
    @IsOptional()
    @IsString()
    published_at?: Date;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_published?: boolean;

    @Expose()
    @IsOptional()
    @IsNumber()
    user_id?: number;
}

export class NewsResponseDto {
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    content?: string;

    @Expose()
    published_at?: Date;

    @Expose()
    is_published?: boolean;

    @Expose()
    user_id?: number;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListNewsRequestDto {
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