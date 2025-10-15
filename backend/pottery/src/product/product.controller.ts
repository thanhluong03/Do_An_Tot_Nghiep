import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { ProductService } from '@app/product';
import {
    CreateProductDto,
    UpdateProductDto,
    ListProductRequestDto,
    ProductResponseDto,
} from './product.dto';
import { plainToInstance } from 'class-transformer';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post('createproduct')
    @UseInterceptors(FilesInterceptor('images'))
    async create(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() createProductDto: CreateProductDto,
    ): Promise<ProductResponseDto> {
        const productData: any = {
            name: createProductDto.name,
            description: createProductDto.description,
            price: createProductDto.price,
            category_id: createProductDto.category_id,
            supplier_id: createProductDto.supplier_id,
        };
        if (files && files.length > 0) {
            console.log('Processing', files.length, 'files');
            productData.images = files.map((file, index) => {
                console.log(`File ${index + 1}:`, file.originalname, file.mimetype, file.size);
                return {
                    image_data: file.buffer,
                };
            });
        } else {
            console.log('No files received');
        }

        try {
            const product = await this.productService.create(productData);
            return plainToInstance(ProductResponseDto, product, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    @Get('listproduct')
    async findAll(@Query() query: ListProductRequestDto) {
        return this.productService.findAll(query);
    }

    @Get('productdetail/:id')
    async findOne(@Param('id') id: number): Promise<ProductResponseDto> {
        const product = await this.productService.findOne(Number(id));
        return plainToInstance(ProductResponseDto, product, {
            excludeExtraneousValues: true,
        });
    }

    @Put('updateproduct/:id')
    @UseInterceptors(FilesInterceptor('images'))
    async update(
        @Param('id') id: number,
        @UploadedFiles() files: Express.Multer.File[],
        @Body() updateProductDto: UpdateProductDto,
    ): Promise<ProductResponseDto> {
        if (files && files.length > 0) {
            updateProductDto.images = files.map((file) => ({
                image_data: file.buffer,
            }));
        }

        const product = await this.productService.update(Number(id), updateProductDto);
        return plainToInstance(ProductResponseDto, product, {
            excludeExtraneousValues: true,
        });
    }

    @Delete('deleteproduct/:id')
    async remove(@Param('id') id: number) {
        return this.productService.softDelete(Number(id));
    }

    @Get('listproduct-by-store/:storeId')
    async findAllByStore(@Param('storeId') storeId: number) {
        return this.productService.findAllByStore(Number(storeId));
    }

    @Get('listproduct-by-inventory')
    async findAllByInventory() {
        return this.productService.findAllByInventory();
    }

    @Get('listproduct-by-category/:categoryid')
    async getInventoryByCategory(@Param('categoryid') categoryId: string) {
        if (!categoryId) {
            return { error: 'categoryid param is required' };
        }
        const catId = Number(categoryId);
        if (isNaN(catId)) {
            return { products: [] };
        }
        return await this.productService.findAllByInventoryWithCategory(catId);
    }

    @Get('productdetail-by-inventory/:productId')
    async getInventoryDetailByProductId(@Param('productId') productId: string) {
        if (!productId) {
            return { error: 'productId param is required' };
        }
        const prodId = Number(productId);
        if (isNaN(prodId)) {
            return { products: [] };
        }
        return await this.productService.findInventoryDetailByProductId(prodId);
    }
}
