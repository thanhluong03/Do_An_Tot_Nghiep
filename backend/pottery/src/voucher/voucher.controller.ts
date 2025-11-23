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
import { VoucherService } from '@app/voucher';
import {
    CreateVoucherDto,
    UpdateVoucherDto,
    ListVoucherRequestDto,
    VoucherResponseDto,
    VoucherCustomerDto,
    UpdateVoucherCustomerStatusDto,
} from './voucher.dto';
import { plainToInstance } from 'class-transformer';

@Controller('vouchers')
export class VoucherController {
    constructor(private readonly voucherService: VoucherService) { }

    @Post('createvoucher')
    async createMany(
        @Body() createVoucherDtos: CreateVoucherDto[],
    ): Promise<{ message: string, voucher: VoucherResponseDto }[]> {
        const results = await Promise.all(
            createVoucherDtos.map(dto => this.voucherService.create(dto))
        );
        return results.map(result => ({
            message: result.message,
            voucher: plainToInstance(VoucherResponseDto, result.voucher, {
                excludeExtraneousValues: true,
            })
        }));
    }

    @Get('listvouchers')
    async findAllAdmin(@Query() query: ListVoucherRequestDto): Promise<VoucherResponseDto[]> {
        const result = await this.voucherService.findAll(query);
        return result.vouchers.map(voucher =>
            plainToInstance(VoucherResponseDto, voucher, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('listvoucherselectofcustomers')
    async findAllCustomer(@Query() query: ListVoucherRequestDto): Promise<VoucherResponseDto[]> {
        await this.voucherService.softDeleteExpiredVouchers();
        const result = await this.voucherService.findAllForCustomer(query);
        return result.vouchers.map(voucher =>
            plainToInstance(VoucherResponseDto, voucher, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('voucherdetail/:id')
    async findOne(@Param('id') id: number): Promise<VoucherResponseDto[]> {
        const result = await this.voucherService.findOne(Number(id));
        return [
            plainToInstance(VoucherResponseDto, result.voucher, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updatevoucher/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateVoucherDto: UpdateVoucherDto,
    ): Promise<{ message: string, voucher: VoucherResponseDto }[]> {
        const result = await this.voucherService.update(Number(id), updateVoucherDto);
        return [{
            message: result.message,
            voucher: plainToInstance(VoucherResponseDto, result.voucher, {
                excludeExtraneousValues: true,
            })
        }];
    }

    @Delete('deletevoucher/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.voucherService.softDelete(Number(id));
        return [result];
    }

    @Post('updatevouchercustomer')
    async updateVoucherCustomer(@Body() voucherCustomerDto: VoucherCustomerDto): Promise<{ message: string, voucherCustomer?: any }> {
        return await this.voucherService.updateVoucherCustomer(
            voucherCustomerDto.customer_id,
            voucherCustomerDto.voucher_id
        );
    }

    @Get('customer/:customerId')
    async getAvailableVouchersByCustomer(@Param('customerId') customerId: number): Promise<VoucherResponseDto[]> {
        const vouchers = await this.voucherService.findAvailableVouchersByCustomer(Number(customerId));
        return vouchers.map(voucher =>
            plainToInstance(VoucherResponseDto, voucher, {
                excludeExtraneousValues: true,
            }),
        );
    }
    @Put('updatevouchercustomerstatus/:voucherCustomerId')
    async updateVoucherCustomerStatus(
        @Param('voucherCustomerId') id: number,
        @Body() dto: UpdateVoucherCustomerStatusDto
    ): Promise<{ message: string, voucherCustomer?: any }> {
        // Chuyển đổi status sang enum
        const statusEnum = dto.status as any;
        return await this.voucherService.updateVoucherCustomerStatus(Number(id), statusEnum);
    }
}