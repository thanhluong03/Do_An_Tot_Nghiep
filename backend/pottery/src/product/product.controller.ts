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
        // Handle images
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

        // Handle classifications
        if (createProductDto.classifications) {
            let parsedClassifications;
            try {
                // Nếu classifications là string (từ FormData), parse nó
                if (typeof createProductDto.classifications === 'string') {
                    parsedClassifications = JSON.parse(createProductDto.classifications);
                } else {
                    parsedClassifications = createProductDto.classifications;
                }
                console.log('Processing classifications:', parsedClassifications);
                productData.classifications = parsedClassifications;
            } catch (error) {
                console.error('Error parsing classifications:', error);
            }
        }

        // Handle relationships
        if (createProductDto.relationships) {
            let parsedRelationships;
            try {
                // Nếu relationships là string (từ FormData), parse nó
                if (typeof createProductDto.relationships === 'string') {
                    parsedRelationships = JSON.parse(createProductDto.relationships);
                } else {
                    parsedRelationships = createProductDto.relationships;
                }
                console.log('Processing relationships:', parsedRelationships);
                productData.relationships = parsedRelationships;
            } catch (error) {
                console.error('Error parsing relationships:', error);
            }
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
        console.log('Updating product with ID:', id);
        console.log('Update DTO received:', {
            name: updateProductDto.name,
            filesCount: files?.length || 0,
            hasClassifications: !!updateProductDto.classifications,
            hasRelationships: !!updateProductDto.relationships,
        });

        const productData: any = { ...updateProductDto };

        // Handle images
        if (files && files.length > 0) {
            console.log('Processing', files.length, 'update images');
            productData.images = files.map((file) => ({
                image_data: file.buffer,
            }));
        }

        if (updateProductDto.keepImageIndices) {
            try {
                const keepIndices = JSON.parse(updateProductDto.keepImageIndices);
                console.log('Keep image indices:', keepIndices);
                productData.keepImageIndices = keepIndices;
            } catch (error) {
                console.error('Error parsing keepImageIndices:', error);
            }
        }
        if (updateProductDto.imageOperations) {
            try {
                const imageOps = JSON.parse(updateProductDto.imageOperations);
                console.log('Image operations:', imageOps);
                productData.imageOperations = imageOps;
            } catch (error) {
                console.error('Error parsing imageOperations:', error);
            }
        }

        // Handle classifications for update
        if (updateProductDto.classifications) {
            let parsedClassifications;
            try {
                // Nếu classifications là string (từ FormData), parse nó
                if (typeof updateProductDto.classifications === 'string') {
                    parsedClassifications = JSON.parse(updateProductDto.classifications);
                } else {
                    parsedClassifications = updateProductDto.classifications;
                }
                console.log('Processing update classifications:', parsedClassifications);
                productData.classifications = parsedClassifications;
            } catch (error) {
                console.error('Error parsing update classifications:', error);
            }
        }

        // Handle relationships for update
        if (updateProductDto.relationships) {
            let parsedRelationships;
            try {
                // Nếu relationships là string (từ FormData), parse nó
                if (typeof updateProductDto.relationships === 'string') {
                    parsedRelationships = JSON.parse(updateProductDto.relationships);
                } else {
                    parsedRelationships = updateProductDto.relationships;
                }
                console.log('Processing update relationships:', parsedRelationships);
                productData.relationships = parsedRelationships;
            } catch (error) {
                console.error('Error parsing update relationships:', error);
            }
        }

        try {
            const product = await this.productService.update(Number(id), productData);
            return plainToInstance(ProductResponseDto, product, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
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

    @Get('listproduct-by-supplier/:supplierId')
    async findBySupplier(@Param('supplierId') supplierId: number): Promise<ProductResponseDto[]> {
        const products = await this.productService.findBySupplier(supplierId);
        return plainToInstance(ProductResponseDto, Array.isArray(products) ? products : [products], {
            excludeExtraneousValues: true,
        });
    }
}
