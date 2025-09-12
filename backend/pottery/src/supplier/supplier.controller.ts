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
import { SupplierService } from '@app/supplier';
import {
    CreateSupplierDto,
    UpdateSupplierDto,
    ListSupplierRequestDto,
    SupplierResponseDto,
} from './supplier.dto';
import { plainToInstance } from 'class-transformer';

@Controller('suppliers')
export class SupplierController {
    constructor(private readonly supplierService: SupplierService) { }

    @Post('createsupplier')
    async createMany(
        @Body() createSupplierDtos: CreateSupplierDto[],
    ): Promise<SupplierResponseDto[]> {
        const results = await Promise.all(
            createSupplierDtos.map(dto => this.supplierService.create(dto))
        );
        return results.map(result =>
            plainToInstance(SupplierResponseDto, result.supplier, {
                excludeExtraneousValues: true,
            })
        );
    }

    @Get('listsupplier')
    async findAll(@Query() query: ListSupplierRequestDto): Promise<SupplierResponseDto[]> {
        const result = await this.supplierService.findAll(query);
        return result.suppliers.map(supplier =>
            plainToInstance(SupplierResponseDto, supplier, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('supplierdetail/:id')
    async findOne(@Param('id') id: number): Promise<SupplierResponseDto[]> {
        const result = await this.supplierService.findOne(Number(id));
        return [
            plainToInstance(SupplierResponseDto, result.supplier, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updatesupplier/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateSupplierDto: UpdateSupplierDto,
    ): Promise<SupplierResponseDto[]> {
        const result = await this.supplierService.update(Number(id), updateSupplierDto);
        return [
            plainToInstance(SupplierResponseDto, result.supplier, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Delete('deletesupplier/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.supplierService.softDelete(Number(id));
        return [result];
    }
}