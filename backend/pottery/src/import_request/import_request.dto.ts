import {
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsString,
    IsEnum,
    ValidateNested,
    IsArray,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { importRequestStatus } from '@app/database';

export class CreateImportRequestDetailDto {
    @IsNotEmpty()
    @IsNumber()
    product_id: number;

    @IsOptional()
    @IsNumber()
    classification_attribute_relationship_id?: number;

    @IsNotEmpty()
    @IsNumber()
    requested_quantity: number;
}

export class CreateImportRequestDto {
    @IsNotEmpty()
    @IsNumber()
    store_id: number;

    @IsOptional()
    @IsString()
    note?: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateImportRequestDetailDto)
    importRequestDetails: CreateImportRequestDetailDto[];
}

export class UpdateImportRequestDetailDto {
    @IsOptional()
    @IsNumber()
    id?: number;

    @IsNotEmpty()
    @IsNumber()
    product_id: number;

    @IsOptional()
    @IsNumber()
    classification_attribute_relationship_id?: number;

    @IsNotEmpty()
    @IsNumber()
    requested_quantity: number;

    @IsOptional()
    @IsNumber()
    accept_quantity?: number;
}

export class UpdateImportRequestDto {
    @IsOptional()
    @IsEnum(importRequestStatus)
    import_request_status?: importRequestStatus;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateImportRequestDetailDto)
    importRequestDetails?: UpdateImportRequestDetailDto[];
}

export class AcceptImportRequestDetailDto {
    @IsNotEmpty()
    @IsNumber()
    detail_id: number;

    @IsNotEmpty()
    @IsNumber()
    product_id: number;

    @IsOptional()
    @IsNumber()
    classification_attribute_relationship_id?: number;

    @IsNotEmpty()
    @IsNumber()
    accept_quantity: number;
}

export class AcceptImportRequestDto {
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => AcceptImportRequestDetailDto)
    details: AcceptImportRequestDetailDto[];
}

export class GetImportRequestsQueryDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    size?: number = 10;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    store_id?: number;
}