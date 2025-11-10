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

export class CreateVoucherDto {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsOptional()
    //@Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    start_time?: Date;

    @Expose()
    @IsOptional()
    //@Matches(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/)
    end_time?: Date;

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
    @IsNumber()
    @IsPositive()
    voucher_percentage?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    order_conditions?: number;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateVoucherDto {
    @Expose()
    @IsString()
    name: string;

    @Expose()
    @IsOptional()
    //@Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    start_time?: Date;

    @Expose()
    @IsOptional()
    //@Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    end_time?: Date;

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
    @IsNumber()
    @IsPositive()
    voucher_percentage?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    quantity?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    order_conditions?: number;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class VoucherResponseDto {
    @Expose()
    id: number;

    @Expose()
    name: string;

    @Expose()
    start_time?: Date;

    @Expose()
    end_time?: Date;

    @Expose()
    effective_period_begins?: Date;

    @Expose()
    effective_period_ends?: Date;

    @Expose()
    voucher_percentage?: number;

    @Expose()
    quantity?: number;

    @Expose()
    order_conditions?: number;

    @Expose()
    is_active?: boolean;

    created_at: Date;

    @Expose()
    updated_at: Date | null;
}

export class ListVoucherRequestDto {
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

export class VoucherCustomerDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    voucher_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    customer_id: number;
}

export class UpdateVoucherCustomerStatusDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    voucherCustomerId: number;

    @Expose()
    @IsString()
    status: string;
}