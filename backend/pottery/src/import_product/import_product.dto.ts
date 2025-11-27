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
  supplier_id?: number;

  @IsOptional()
  @IsInt()
  user_id?: number;
}

export class ImportProductClassificationDto {
  @IsNotEmpty()
  product_id: number | string;

  @IsOptional()
  classification_attribute_relationship_id?: number | string;

  @IsInt()
  @IsNotEmpty()
  import_quantity: number;

  @IsNumber()
  @IsNotEmpty()
  import_price: number;
}

export class CreateImportProductDto {
  @IsNotEmpty()
  user_id: number | string;

  @IsNotEmpty()
  supplier_id: number | string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductClassificationDto)
  details: ImportProductClassificationDto[];
}

export class UpdateImportProductDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductClassificationDto)
  details?: ImportProductClassificationDto[];
}
