import { IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { DriverStatus } from '@app/database/entities';

export class AssignDriverDto {
    @IsNotEmpty()
    @IsNumber()
    order_id: number;

    @IsNotEmpty()
    @IsNumber()
    driver_id: number;
}

export class UpdateDriverLocationDto {
    @IsNotEmpty()
    @IsNumber()
    order_id: number;

    @IsNotEmpty()
    @IsNumber()
    driver_id: number;

    @IsNotEmpty()
    @IsEnum(DriverStatus)
    driver_status: DriverStatus;

    @IsOptional()
    @IsNumber()
    latitude?: number;

    @IsOptional()
    @IsNumber()
    longitude?: number;
}

export class AcceptOrderDto {
    @IsNotEmpty()
    @IsNumber()
    order_id: number;

    @IsNotEmpty()
    @IsNumber()
    driver_id: number;

    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @IsNotEmpty()
    @IsNumber()
    longitude: number;
}

export class RejectOrderDto {
    @IsNotEmpty()
    @IsNumber()
    order_id: number;
}

export class GetOrdersForDriverDto {
    @IsOptional()
    @IsEnum(DriverStatus)
    status?: DriverStatus;

    @IsOptional()
    @IsNumber()
    driver_id?: number;
}

export class UpdateLocationDto {
    @IsNotEmpty()
    @IsNumber()
    order_id: number;

    @IsNotEmpty()
    @IsNumber()
    driver_id: number;

    @IsNotEmpty()
    @IsNumber()
    latitude: number;

    @IsNotEmpty()
    @IsNumber()
    longitude: number;
}
