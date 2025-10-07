import { Body, Controller, Delete, Param, Put, Post, Get, Query } from '@nestjs/common';
import { InventoryService } from '@app/inventory';
import {
    CreateInventoryDto,
    UpdateInventoryDto,
    ListInventoryDto,
    TransferInventoryDto,
    DistributeInventoryDto,
    CollectInventoryDto,
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

    @Post('transfer')
    async transfer(@Body() dto: TransferInventoryDto) {
        return await this.inventoryService.transferInventory({
            product_id: dto.product_id,
            from_store_id: dto.from_store_id === 'all' ? 'all' : Number(dto.from_store_id),
            to_store_id: dto.to_store_id === 'all' ? 'all' :
                Array.isArray(dto.to_store_id) ? dto.to_store_id.map(id => Number(id)) : Number(dto.to_store_id),
            quantity: dto.quantity,
        });
    }

    @Post('distribute')
    async distribute(@Body() dto: DistributeInventoryDto) {
        return await this.inventoryService.distributeInventory(dto);
    }

    @Post('collect')
    async collect(@Body() dto: CollectInventoryDto) {
        return await this.inventoryService.collectInventory({
            product_id: dto.product_id,
            from_store_ids: dto.from_store_ids === 'all' ? 'all' :
                Array.isArray(dto.from_store_ids) ? dto.from_store_ids : [Number(dto.from_store_ids)],
            to_store_id: dto.to_store_id,
            quantity_per_store: dto.quantity_per_store,
        });
    }
}
