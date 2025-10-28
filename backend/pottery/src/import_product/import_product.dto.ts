import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class ImportProductClassificationDto {
  @IsNotEmpty()
  classification_attribute_relationship_id: number | string;

  @IsInt()
  @IsNotEmpty()
  import_quantity: number;

  @IsNumber()
  @IsNotEmpty()
  import_price: number;
}

export class CreateImportProductDto {
  @IsNotEmpty()
  product_id: number | string;

  @IsNotEmpty()
  supplier_id: number | string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductClassificationDto)
  classifications: ImportProductClassificationDto[];
}

export class UpdateImportProductDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductClassificationDto)
  classifications?: ImportProductClassificationDto[];
}
