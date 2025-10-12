import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsPositive } from 'class-validator';

export class CreateDeliveryProofDto {
    @Expose()
    @IsNumber()
    order_id: number;

    @Expose()
    @IsNumber()
    user_id: number;

    @Expose()
    @IsOptional()
    image_proof?: Buffer;
}

export class UpdateDeliveryProofDto {
    @Expose()
    @IsNumber()
    order_id: number;

    @Expose()
    @IsNumber()
    user_id: number;

    @Expose()
    @IsOptional()
    image_proof?: Buffer;
}

export class ListDeliveryProofRequestDto {
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
}
