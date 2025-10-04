
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

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
