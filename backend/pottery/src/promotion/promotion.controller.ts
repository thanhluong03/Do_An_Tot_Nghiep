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
import { PromotionService } from '@app/promotion';
import {
    CreatePromotionDto,
    UpdatePromotionDto,
    ListPromotionRequestDto,
    PromotionResponseDto,
    AssignPromotionToProductsDto,
} from './promotion.dto';
import { plainToInstance } from 'class-transformer';

@Controller('promotions')
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) { }

    @Post('createpromotion')
    async createMany(
        @Body() createPromotionDtos: CreatePromotionDto[],
    ): Promise<{ message: string, promotion: PromotionResponseDto }[]> {
        const results = await Promise.all(
            createPromotionDtos.map(dto => this.promotionService.create(dto))
        );
        return results.map(result => ({
            message: result.message,
            promotion: plainToInstance(PromotionResponseDto, result.promotion, {
                excludeExtraneousValues: true,
            })
        }));
    }

    @Get('listpromotion')
    async findAll(@Query() query: ListPromotionRequestDto): Promise<PromotionResponseDto[]> {
        await this.promotionService.softDeleteExpiredPromotions();
        const result = await this.promotionService.findAll(query);
        return result.promotions.map(promotion =>
            plainToInstance(PromotionResponseDto, promotion, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('promotiondetail/:id')
    async findOne(@Param('id') id: number): Promise<PromotionResponseDto[]> {
        const result = await this.promotionService.findOne(Number(id));
        return [
            plainToInstance(PromotionResponseDto, result.promotion, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updatepromotion/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updatePromotionDto: UpdatePromotionDto,
    ): Promise<{ message: string, promotion: PromotionResponseDto }[]> {
        const result = await this.promotionService.update(Number(id), updatePromotionDto);
        return [{
            message: result.message,
            promotion: plainToInstance(PromotionResponseDto, result.promotion, {
                excludeExtraneousValues: true,
            })
        }];
    }

    @Delete('deletepromotion/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.promotionService.softDelete(Number(id));
        return [result];
    }

    @Get('listproductpromotions')
    async getProductPromotions() {
        return await this.promotionService.getAllProductPromotions();
    }

    @Post('setproductpromotion')
    async setProductPromotion(@Body() body: { assignments: { productId: number, promotionId: number }[] }): Promise<{ message: string }> {
        return await this.promotionService.setProductPromotion(body.assignments);
    }

}