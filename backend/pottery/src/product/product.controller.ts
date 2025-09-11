import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ProductService } from '@app/product';
import { CreateProductDto, UpdateProductDto, ListProductRequestDto, ProductResponseDto } from './product.dto';
import { plainToInstance } from 'class-transformer';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post('createproduct')
    async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
        const product = await this.productService.create(createProductDto);
        return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
    }

    @Get('listproduct')
    async findAll(@Query() query: ListProductRequestDto) {
        return this.productService.findAll(query);
    }

    @Get('productdetail/:id')
    async findOne(@Param('id') id: number): Promise<ProductResponseDto> {
        const product = await this.productService.findOne(Number(id));
        return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
    }

    @Put('updateproduct/:id')
    async update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
        const product = await this.productService.update(Number(id), updateProductDto);
        return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
    }

    @Delete('deleteproduct/:id')
    async remove(@Param('id') id: number) {
        return this.productService.softDelete(Number(id));
    }
}
