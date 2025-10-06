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
import { CategoryService } from '@app/category';
import {
    CreateCategoryDto,
    UpdateCategoryDto,
    ListCategoryRequestDto,
    CategoryResponseDto,
} from './category.dto';
import { plainToInstance } from 'class-transformer';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post('createcategory')
    async createMany(
        @Body() createCategoryDtos: CreateCategoryDto[],
    ): Promise<any> {
        try {
            const results = await Promise.all(
                createCategoryDtos.map(dto => this.categoryService.create(dto))
            );
            return {
                message: 'Create category successfully',
                data: results.map(result =>
                    plainToInstance(CategoryResponseDto, result.category, {
                        excludeExtraneousValues: true,
                    })
                ),
                success: true
            };
        } catch (error) {
            return {
                message: 'Create category failed',
                error: error.message,
                success: false
            };
        }
    }

    @Get('listcategory')
    async findAll(@Query() query: ListCategoryRequestDto): Promise<any> {
        try {
            const result = await this.categoryService.findAll(query);
            return {
                message: 'Get category list successfully',
                data: result.categories.map(category =>
                    plainToInstance(CategoryResponseDto, category, {
                        excludeExtraneousValues: true,
                    })
                ),
                success: true
            };
        } catch (error) {
            return {
                message: 'Get category list failed',
                error: error.message,
                success: false
            };
        }
    }

    @Get('categorydetail/:id')
    async findOne(@Param('id') id: number): Promise<any> {
        try {
            const result = await this.categoryService.findOne(Number(id));
            return {
                message: 'Get category detail successfully',
                data: [
                    plainToInstance(CategoryResponseDto, result.category, {
                        excludeExtraneousValues: true,
                    })
                ],
                success: true
            };
        } catch (error) {
            return {
                message: 'Get category detail failed',
                error: error.message,
                success: false
            };
        }
    }

    @Put('updatecategory/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateCategoryDto: UpdateCategoryDto,
    ): Promise<any> {
        try {
            const result = await this.categoryService.update(Number(id), updateCategoryDto);
            return {
                message: 'Update category successfully',
                data: [
                    plainToInstance(CategoryResponseDto, result.category, {
                        excludeExtraneousValues: true,
                    })
                ],
                success: true
            };
        } catch (error) {
            return {
                message: 'Update category failed',
                error: error.message,
                success: false
            };
        }
    }

    @Delete('deletecategory/:id')
    async removeOne(@Param('id') id: number): Promise<any> {
        try {
            const result = await this.categoryService.softDelete(Number(id));
            return {
                message: 'Delete category successfully',
                data: [result],
                success: true
            };
        } catch (error) {
            return {
                message: 'Delete category failed',
                error: error.message,
                success: false
            };
        }
    }
}