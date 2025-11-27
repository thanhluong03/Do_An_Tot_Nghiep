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
    const result = await this.importProductService.create({
      user_id: dto.user_id,
      supplier_id: dto.supplier_id,
      details: dto.details,
    });
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
    return await this.importProductService.update(Number(id), {
      details: dto.details,
    });
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
