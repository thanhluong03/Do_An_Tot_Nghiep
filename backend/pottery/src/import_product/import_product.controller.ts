import {
  Body,
  Controller,
  Delete,
  Param,
  Put,
  Post,
  Get,
  Query,
} from '@nestjs/common';
import { ImportProductService } from '@app/import_product';
import {
  CreateImportProductDto,
  UpdateImportProductDto,
  ListImportProductDto,
} from './import_product.dto';

@Controller('importproduct')
export class ImportProductController {
  constructor(private readonly importProductService: ImportProductService) { }

  @Post('createimportproduct')
  async create(@Body() dto: CreateImportProductDto) {
    let result;
    if (Array.isArray(dto.classifications) && dto.classifications.length > 0) {
      result = await this.importProductService.create({
        product_id: dto.product_id,
        supplier_id: dto.supplier_id,
        classifications: dto.classifications,
      });
    } else {
      result = await this.importProductService.create({
        product_id: dto.product_id,
        supplier_id: dto.supplier_id,
        import_quantity: dto.import_quantity,
        import_price: dto.import_price,
      });
    }
    return {
      success: result.success,
      message: result.message,
      data: result.importProduct || null,
      importProducts: result.importProducts || null,
      error: result.error || null,
    };
  }

  @Put('updateimportproduct/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateImportProductDto) {
    // Truyền đúng dữ liệu cho cả hai trường hợp
    if (Array.isArray(dto.classifications) && dto.classifications.length > 0) {
      return await this.importProductService.update(Number(id), {
        classifications: dto.classifications,
      });
    } else {
      return await this.importProductService.update(Number(id), {
        import_quantity: dto.import_quantity,
        import_price: dto.import_price,
      });
    }
  }

  @Delete('deleteimportproduct/:id')
  async delete(@Param('id') id: string) {
    return await this.importProductService.delete(Number(id));
  }

  @Get('list')
  async list(@Query() query: ListImportProductDto) {
    const input = {
      ...query,
      page: query.page ?? 1,
      size: query.size ?? 10,
    };
    return await this.importProductService.list(input);
  }
}
