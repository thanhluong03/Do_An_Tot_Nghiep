import { CategoryEntity, CategoryRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateCategory, IListCategory, IUpdateCategory } from './category.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
    ) { }

    async create(data: ICreateCategory): Promise<{ message: string, category: CategoryEntity | null }> {
        try {
            const category = await this.categoryRepository.create({
                name: data.name,
                description: data.description,
            });
            return {
                message: 'Category created successfully',
                category,
            };
        } catch (error) {
            return {
                message: 'Failed to create category',
                category: null,
            };
        }
    }

    async findAll(params: IListCategory): Promise<{ message: string, categories: CategoryEntity[] }> {
        const categories = await this.categoryRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: categories.length > 0 ? 'Categories fetched successfully' : 'No categories found',
            categories,
        };
    }

    async findOne(id: number): Promise<{ message: string, category: CategoryEntity }> {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new NotFoundException('Category not found');
        return {
            message: 'Category fetched successfully',
            category,
        };
    }

    async update(id: number, data: IUpdateCategory): Promise<{ message: string, category: CategoryEntity }> {
        await this.categoryRepository.update(id, data);
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new NotFoundException('Category not found');
        return {
            message: 'Category updated successfully',
            category,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const category = await this.categoryRepository.findById(id);
        if (!category) throw new NotFoundException('Category not found');
        await this.categoryRepository.softDelete(id);
        return { message: 'Category deleted successfully' };
    }
}
