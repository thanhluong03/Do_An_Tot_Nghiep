
import { Expose, Type } from 'class-transformer';
import {
    IsOptional,
    IsString,
    IsNumber,
    IsEnum,
    IsArray,
    ValidateNested,
    IsPositive,
} from 'class-validator';
import {
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
} from '../../libs/database/src/entities/order.entity';

export class SuccessResponseDto<T = any> {
    @Expose()
    success: boolean = true;

    @Expose()
    message: string;

    @Expose()
    data?: T;

    constructor(message: string, data?: T) {
        this.message = message;
        this.data = data;
    }
}

export class ErrorResponseDto {
    @Expose()
    success: boolean = false;

    @Expose()
    message: string;

    @Expose()
    error?: any;

    constructor(message: string, error?: any) {
        this.message = message;
        this.error = error;
    }
}
export class OrderItemDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    product_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    store_id: number;

    @Expose()
    @IsNumber()
    @IsPositive()
    quantity: number;

    @Expose()
    @IsNumber()
    price_at_order: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    classification_attribute_relationship_id?: number;

    @Expose()
    @IsOptional()
    @IsString()
    attribute1_name?: string;

    @Expose()
    @IsOptional()
    @IsString()
    attribute2_name?: string;
}

export class CreateOrderDto {
    @Expose()
    @IsNumber()
    @IsPositive()
    customer_id: number;

    @Expose()
    @IsOptional()
    @IsString()
    guest_id?: string;

    @Expose()
    @IsOptional()
    @IsString()
    shipping_address?: string;


    @Expose()
    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: PaymentMethod;

    @Expose()
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @Expose()
    @IsOptional()
    @IsEnum(PaymentStatus)
    payment_status?: PaymentStatus;

    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @Expose()
    @IsOptional()
    @IsString()
    note?: string;
}

export class UpdateOrderDto {
    @Expose()
    @IsOptional()
    @IsEnum(OrderStatus)
    status?: OrderStatus;

    @Expose()
    @IsOptional()
    @IsEnum(PaymentStatus)
    payment_status?: PaymentStatus;

    @Expose()
    @IsOptional()
    @IsString()
    shipping_address?: string;

    @Expose()
    @IsOptional()
    @IsEnum(PaymentMethod)
    payment_method?: PaymentMethod;

    @Expose()
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items?: OrderItemDto[];

    @Expose()
    @IsOptional()
    @IsString()
    reason_change?: string;

    @Expose()
    @IsOptional()
    @IsNumber()
    user_id?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    customer_id?: number;

    @Expose()
    @IsOptional()
    @IsString()
    actor_type?: string;

    @Expose()
    @IsOptional()
    @IsString()
    note?: string;

    @Expose()
    @IsOptional()
    @IsString()
    cancel_reason?: string;

    @Expose()
    @IsOptional()
    @IsString()
    person_cancel?: string;

    @Expose()
    @IsOptional()
    @IsString()
    delivery_fail_reason?: string;
}
export class OrderResponseDto {
    @Expose()
    id: number;

    @Expose()
    customer_id: number;

    @Expose()
    shipping_address?: string;

    @Expose()
    payment_method?: PaymentMethod;

    @Expose()
    status: OrderStatus;

    @Expose()
    payment_status: PaymentStatus;

    @Expose()
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date;
}
