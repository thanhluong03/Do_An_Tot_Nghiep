import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class CreatePermissionDto {
    @IsNumber()
    @IsNotEmpty()
    role_id: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class UpdatePermissionsDto {
    @IsArray()
    @IsString({ each: true })
    permissions: string[];
}

export class PermissionResponseDto {
    @Expose()
    id: number;

    @Expose()
    role_id: number;

    @Expose()
    name: string;

    @Expose()
    description: string;

    @Expose()
    created_at: Date;

    @Expose()
    updated_at: Date;
}