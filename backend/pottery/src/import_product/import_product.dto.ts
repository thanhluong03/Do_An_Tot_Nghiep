
import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class ListImportProductDto {
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
    supplier_id?: number;
}

export class ImportProductItemDto {
    @IsNotEmpty()
    product_id: number | string;

    @IsInt()
    @IsNotEmpty()
    import_quantity: number;

    @IsInt()
    @IsOptional()
    import_price?: number;
}

export class CreateImportProductDto {
    @IsNotEmpty()
    supplier_id: number | string;

    @IsNotEmpty()
    items: ImportProductItemDto[];
}

export class UpdateImportProductDto {
    @IsOptional()
    @IsInt()
    import_quantity?: number;
}
