import { Body, Controller, Delete, Param, Put, Post, Get, Query } from '@nestjs/common';
import { InventoryService } from '@app/inventory';
import {
    CreateInventoryDto,
    UpdateInventoryDto,
    TransferInventoryDto,
    DistributeInventoryDto,
    CollectInventoryDto,
} from './inventory.dto';

@Controller('inventory')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }


    @Post('createinventory')
    async create(@Body() dto: CreateInventoryDto[]) {
        return await Promise.all(
            dto.map((item) =>
                this.inventoryService.create({
                    ...item,
                    product_id: item.product_id,
                    store_id: item.store_id,
                })
            )
        );
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
    async list(@Query() query: any) {
        const input = {
            ...query,
            page: Number(query.page) || 1,
            size: Number(query.size) || 10,
        };
        return await this.inventoryService.list(input);
    }

    @Get('details/:id')
    async getInventoryDetails(@Param('id') id: string) {
        return await this.inventoryService.getInventoryDetails(Number(id));
    }

    @Post('transfer')
    async transfer(@Body() dto: TransferInventoryDto) {
        return await this.inventoryService.transferInventory({
            product_id: dto.product_id,
            from_store_ids: dto.from_store_ids,
            to_store_ids: dto.to_store_ids,
            details: dto.details,
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
