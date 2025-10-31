import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsPositive } from 'class-validator';

export class CreateCustomerDto {
    @Expose()
    @IsString()
    username: string;

    @Expose()
    @IsString()
    password: string;

    @Expose()
    @IsOptional()
    @IsEmail()
    email?: string;

    @Expose()
    @IsOptional()
    @IsString()
    full_name?: string;

    @Expose()
    @IsOptional()
    @IsString()
    phone_number?: string;

    @Expose()
    @IsOptional()
    @IsString()
    address?: string;


    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateCustomerDto {
    @Expose()
    @IsOptional()
    @IsString()
    username?: string;

    @Expose()
    @IsOptional()
    @IsString()
    password?: string;

    @Expose()
    @IsOptional()
    @IsEmail()
    email?: string;

    @Expose()
    @IsOptional()
    @IsString()
    full_name?: string;

    @Expose()
    @IsOptional()
    @IsString()
    phone_number?: string;

    @Expose()
    @IsOptional()
    @IsString()
    address?: string;

    @Expose()
    @IsOptional()
    avatar_image?: Buffer;

    @Expose()
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class ListCustomerRequestDto {
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

    @Expose({ name: 'start_date' })
    @IsOptional()
    @IsString()
    start_date?: string;

    @Expose({ name: 'end_date' })
    @IsOptional()
    @IsString()
    end_date?: string;
}
