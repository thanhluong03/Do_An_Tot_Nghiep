import { Expose, Type } from 'class-transformer';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEmail, IsPositive } from 'class-validator';

export class CreateUserDto {
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

    @Expose()
    @IsNumber()
    @IsPositive()
    role_id: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number) // ✅ CẦN DÒNG NÀY ĐỂ ÉP KIỂU
    store_id?: number;

}

export class UpdateUserDto {
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

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    role_id?: number;

    @Expose()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    store_id?: number;

}

export class ListUserRequestDto {
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
