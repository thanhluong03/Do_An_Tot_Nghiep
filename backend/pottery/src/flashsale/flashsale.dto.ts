import { Expose } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsPositive,
    IsBoolean,
    IsNumber,
    IsDate,
    Matches,
} from 'class-validator';

export class CreateFlashSaleDto {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    start_time?: string;

    @Expose()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    end_time?: string;

    @Expose()
    @IsOptional()
    @IsDate()
    effective_period_begins?: Date;

    @Expose()
    @IsOptional()
    @IsDate()
    effective_period_ends?: Date;

    @Expose()
    @IsOptional()
    @IsNumber() // Đảm bảo là number
    @IsPositive()
    flash_sale_price?: number;

    // ✅ Bổ sung trường quantity
    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateFlashSaleDto {
    @Expose()
    @IsString() // 💡 Đã sửa lỗi: Tên phải là String, không phải Number
    name: string;

    @Expose()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    start_time?: string;

    @Expose()
    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    end_time?: string;

    @Expose()
    @IsOptional()
    @IsDate()
    effective_period_begins?: Date;

    @Expose()
    @IsOptional()
    @IsDate()
    effective_period_ends?: Date;

    @Expose()
    @IsOptional()
    @IsNumber() // Đảm bảo là number
    @IsPositive()
    flash_sale_price?: number;

    // ✅ Bổ sung trường quantity
    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class FlashSaleResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    start_time?: string;

    @Expose()
    end_time?: string;

    @Expose()
    effective_period_begins?: Date;

    @Expose()
    effective_period_ends?: Date;

    @Expose()
    flash_sale_price?: number;

    // ✅ Bổ sung trường quantity
    @Expose()
    quantity?: number;

    @Expose()
    is_active?: boolean;

    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListFlashSaleRequestDto {
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

export class FlashSaleCustomerDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    flash_sale_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    customer_id: number;
}