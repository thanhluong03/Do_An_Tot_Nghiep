
import { IsInt, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ListInventoryDto {
    @IsInt()
    @IsOptional()
    page?: number = 1;

    @IsInt()
    @IsOptional()
    size?: number = 10;

    @IsOptional()
    key?: string;

    @IsOptional()
    @IsInt()
    product_id?: number;

    @IsOptional()
    @IsInt()
    store_id?: number;
}

export class CreateInventoryDto {
    @IsNotEmpty()
    product_id: number | string;

    @IsNotEmpty()
    store_id: number | string;

    @IsInt()
    @IsNotEmpty()
    quantity_stock: number;
}

export class UpdateInventoryDto {
    @IsOptional()
    @IsInt()
    quantity_stock?: number;

    @IsOptional()
    @IsInt()
    quantity_sold?: number;
}

export class TransferInventoryDto {
    @IsInt()
    @IsNotEmpty()
    product_id: number;

    @IsNotEmpty()
    from_store_id: number | string;

    @IsNotEmpty()
    to_store_id: number | number[] | string;

    @IsInt()
    @IsNotEmpty()
    quantity: number;
}

export class DistributionItemDto {
    @IsInt()
    @IsNotEmpty()
    to_store_id: number;

    @IsInt()
    @IsNotEmpty()
    quantity: number;
}

export class DistributeInventoryDto {
    @IsInt()
    @IsNotEmpty()
    product_id: number;

    @IsInt()
    @IsNotEmpty()
    from_store_id: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DistributionItemDto)
    distributions: DistributionItemDto[];
}

export class CollectInventoryDto {
    @IsInt()
    @IsNotEmpty()
    product_id: number;

    @IsNotEmpty()
    from_store_ids: number[] | string;

    @IsInt()
    @IsNotEmpty()
    to_store_id: number;

    @IsOptional()
    @IsInt()
    quantity_per_store?: number;
}
