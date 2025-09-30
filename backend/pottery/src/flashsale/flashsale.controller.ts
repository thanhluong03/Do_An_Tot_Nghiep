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
import { FlashSaleService } from '@app/flashsale';
import {
    CreateFlashSaleDto,
    UpdateFlashSaleDto,
    ListFlashSaleRequestDto,
    FlashSaleResponseDto,
    FlashSaleCustomerDto,
} from './flashsale.dto';
import { plainToInstance } from 'class-transformer';

@Controller('flashsales')
export class FlashSaleController {
    constructor(private readonly flashSaleService: FlashSaleService) { }

    @Post('createflashsale')
    async createMany(
        @Body() createFlashSaleDtos: CreateFlashSaleDto[],
    ): Promise<{ message: string, flashSale: FlashSaleResponseDto }[]> {
        const results = await Promise.all(
            createFlashSaleDtos.map(dto => this.flashSaleService.create(dto))
        );
        return results.map(result => ({
            message: result.message,
            flashSale: plainToInstance(FlashSaleResponseDto, result.flashSale, {
                excludeExtraneousValues: true,
            })
        }));
    }

    @Get('listflashsales')
    async findAll(@Query() query: ListFlashSaleRequestDto): Promise<FlashSaleResponseDto[]> {
        await this.flashSaleService.softDeleteExpiredFlashSales();
        const result = await this.flashSaleService.findAll(query);
        return result.flashSales.map(flashSale =>
            plainToInstance(FlashSaleResponseDto, flashSale, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('flashsaledetail/:id')
    async findOne(@Param('id') id: number): Promise<FlashSaleResponseDto[]> {
        const result = await this.flashSaleService.findOne(Number(id));
        return [
            plainToInstance(FlashSaleResponseDto, result.flashSale, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updateflashsale/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateFlashSaleDto: UpdateFlashSaleDto,
    ): Promise<{ message: string, flashSale: FlashSaleResponseDto }[]> {
        const result = await this.flashSaleService.update(Number(id), updateFlashSaleDto);
        return [{
            message: result.message,
            flashSale: plainToInstance(FlashSaleResponseDto, result.flashSale, {
                excludeExtraneousValues: true,
            })
        }];
    }

    @Delete('deleteflashsale/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.flashSaleService.softDelete(Number(id));
        return [result];
    }

    @Post('updateflashsalecustomer')
    async updateFlashSaleCustomer(@Body() flashSaleCustomerDto: FlashSaleCustomerDto): Promise<{ message: string, flashSaleCustomer?: any }> {
        return await this.flashSaleService.updateFlashSaleCustomer(
            flashSaleCustomerDto.customer_id,
            flashSaleCustomerDto.flash_sale_id
        );
    }
}