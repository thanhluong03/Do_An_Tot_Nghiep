import { FlashSaleEntity, FlashSaleRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateFlashSale, IListFlashSale, IUpdateFlashSale } from './flashsale.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class FlashSaleService {
    async softDeleteExpiredFlashSales(): Promise<{ message: string, count: number }> {
        const now = new Date();
        const flashSales = await this.flashSaleRepository.findAll({ size: 1000, page: 1 });
        let count = 0;
        for (const flashSale of flashSales) {
            if (flashSale.effective_period_ends && new Date(flashSale.effective_period_ends) < now) {
                await this.flashSaleRepository.softDelete(flashSale.id);
                count++;
            }
        }
        return { message: `Đã xóa mềm ${count} flash sale hết hạn!`, count };
    }
    constructor(
        private readonly flashSaleRepository: FlashSaleRepository,
    ) { }

    async create(data: ICreateFlashSale): Promise<{ message: string, flashSale: FlashSaleEntity | null }> {
        try {
            const flashSale = await this.flashSaleRepository.create({
                name: data.name,
                start_time: data.start_time,
                end_time: data.end_time,
                effective_period_begins: data.effective_period_begins,
                effective_period_ends: data.effective_period_ends,
                is_active: data.is_active,
                flash_sale_price: data.flash_sale_price,
            });
            return {
                message: 'Flash sale created successfully',
                flashSale,
            };
        } catch (error) {
            return {
                message: 'Failed to create flash sale',
                flashSale: null,
            };
        }
    }

    async findAll(params: IListFlashSale): Promise<{ message: string, flashSales: FlashSaleEntity[] }> {
        const flashSales = await this.flashSaleRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: flashSales.length > 0 ? 'Flash sales fetched successfully' : 'No flash sales found',
            flashSales,
        };
    }

    async findOne(id: number): Promise<{ message: string, flashSale: FlashSaleEntity }> {
        const flashSale = await this.flashSaleRepository.findById(id);
        if (!flashSale) throw new NotFoundException('Flash sale not found');
        return {
            message: 'Flash sale fetched successfully',
            flashSale,
        };
    }

    async update(id: number, data: IUpdateFlashSale): Promise<{ message: string, flashSale: FlashSaleEntity }> {
        await this.flashSaleRepository.update(id, data);
        const flashSale = await this.flashSaleRepository.findById(id);
        if (!flashSale) throw new NotFoundException('Flash sale not found');
        return {
            message: 'Flash sale updated successfully',
            flashSale,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const flashSale = await this.flashSaleRepository.findById(id);
        if (!flashSale) throw new NotFoundException('Flash sale not found');
        await this.flashSaleRepository.softDelete(id);
        return { message: 'Flash sale deleted successfully' };
    }
}
