import { Expose } from 'class-transformer';
import { IsNumber, IsString, IsOptional, IsPositive } from 'class-validator';

export class MomoCreatePaymentDto {
    @IsNumber()
    order_id: number;

    @IsNumber()
    amount: number;
}

export class PaymentTransactionResponseDto {
    @Expose()
    id: number;

    @Expose()
    order_id: number;

    @Expose()
    payment_gateway: string;

    @Expose()
    gateway_txn_ref: string;

    @Expose()
    amount: number;

    @Expose()
    txn_status: string;

    @Expose()
    txn_message: string;

    @Expose()
    txn_time: Date;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date;

    @Expose()
    raw_response_data?: any;
}

export class ListPaymentTransactionRequestDto {
    @Expose({ name: 'page' })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    page?: number;

    @Expose({ name: 'size' })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    size?: number;

    @Expose({ name: 'key' })
    @IsOptional()
    @IsString()
    key?: string;

    @Expose({ name: 'orderId' })
    @IsOptional()
    @IsNumber()
    orderId?: number;
}