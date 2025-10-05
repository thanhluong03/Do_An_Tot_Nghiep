import { Body, Controller, Delete, Param, Put, Post, Get, Query } from '@nestjs/common';
import { InventoryService } from '@app/inventory';
import {
    CreateInventoryDto,
    UpdateInventoryDto,
    ListInventoryDto,
} from './inventory.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }


    @Post('createinventory')
    async create(@Body() dto: CreateInventoryDto) {
        return await this.inventoryService.create({
            ...dto,
            product_id: dto.product_id,
            store_id: dto.store_id,
        });
    }

    @Put('updateinventory/:id')
    async update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
        return await this.inventoryService.update(Number(id), dto);
    }

    @Delete('deleteinventory/:id')
    async delete(@Param('id') id: string) {
        return await this.inventoryService.delete(Number(id));
    }


    @Get('list')
    async list(@Query() query: ListInventoryDto) {
        const input = {
            ...query,
            page: query.page ?? 1,
            size: query.size ?? 10,
        };
        return await this.inventoryService.list(input);
    }
}
