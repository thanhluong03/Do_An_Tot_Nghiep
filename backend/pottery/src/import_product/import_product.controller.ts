import { Body, Controller, Delete, Param, Put, Post, Get, Query } from '@nestjs/common';
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
        return await this.importProductService.create({
            ...dto,
            product_id: dto.product_id,
            supplier_id: dto.supplier_id,
        });
    }

    @Put('updateimportproduct/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateImportProductDto) {
        return await this.importProductService.update(Number(id), dto);
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
