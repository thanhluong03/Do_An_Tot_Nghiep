import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { StoreService } from '@app/store';
import {
    CreateStoreDto,
    UpdateStoreDto,
    ListStoreRequestDto,
    StoreResponseDto,
} from './store.dto';
import { plainToInstance } from 'class-transformer';

@Controller('stores')
export class StoreController {
    constructor(private readonly storeService: StoreService) { }

    @Post('createstore')
    async createMany(
        @Body() createStoreDtos: CreateStoreDto[],
    ): Promise<StoreResponseDto[]> {
        const results = await Promise.all(
            createStoreDtos.map(dto => this.storeService.create(dto))
        );
        return results.map(result =>
            plainToInstance(StoreResponseDto, result.store, {
                excludeExtraneousValues: true,
            })
        );
    }

    @Get('liststore')
    async findAll(@Query() query: ListStoreRequestDto): Promise<StoreResponseDto[]> {
        const result = await this.storeService.findAll(query);
        return result.stores.map(store =>
            plainToInstance(StoreResponseDto, store, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('storedetail/:id')
    async findOne(@Param('id') id: number): Promise<StoreResponseDto[]> {
        const result = await this.storeService.findOne(Number(id));
        return [
            plainToInstance(StoreResponseDto, result.store, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updatestore/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateStoreDto: UpdateStoreDto,
    ): Promise<StoreResponseDto[]> {
        const result = await this.storeService.update(Number(id), updateStoreDto);
        return [
            plainToInstance(StoreResponseDto, result.store, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Delete('deletestore/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.storeService.softDelete(Number(id));
        return [result];
    }
}