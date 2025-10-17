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

    @Expose()
    @IsOptional()
    image_data?: Buffer;
}

// Tệp DTO của bạn

export class UpdateNewsDto {
    @Expose()
    @IsOptional() // <-- Thêm IsOptional
    @IsString()
    title?: string; // <-- THÊM DẤU ? ĐỂ LÀM NÓ TÙY CHỌN

    @Expose()
    @IsOptional()
    @IsString()
    content?: string;

    @Expose()
    @IsOptional()
    @IsDate() // Dữ liệu bạn gửi lên sẽ là string, nhưng NestJS/class-transformer có thể chuyển đổi. Đảm bảo kiểu dữ liệu là Date nếu bạn dùng @IsDate.
    published_at?: Date; // <-- Sửa lại kiểu dữ liệu thành Date

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_published?: boolean;

    @Expose()
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @Expose()
    @IsOptional()
    image_data?: Buffer;
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

    @Expose()
    image_data?: string;
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