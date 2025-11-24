import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { CategoryRepository, CategoryEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';

describe('CategoryService', () => {
    let service: CategoryService;
    let mockCategoryRepository: jest.Mocked<CategoryRepository>;

    const createMockCategory = (overrides: Partial<CategoryEntity> = {}): CategoryEntity => ({
        id: 1,
        name: 'Test Category',
        description: 'Test Description',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        products: [],
        ...overrides,
    } as CategoryEntity);

    beforeEach(async () => {
        mockCategoryRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CategoryService,
                { provide: CategoryRepository, useValue: mockCategoryRepository },
            ],
        }).compile();

        service = module.get<CategoryService>(CategoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service đã được khởi tạo thành công');
    });

    describe('create', () => {
        it('should create category successfully', async () => {
            const createData = {
                name: 'New Category',
                description: 'New Description',
            };
            const mockCategory = createMockCategory(createData);
            mockCategoryRepository.create.mockResolvedValue(mockCategory);

            const result = await service.create(createData);

            expect(mockCategoryRepository.create).toHaveBeenCalledWith({
                name: createData.name,
                description: createData.description,
            });
            expect(result.message).toBe('Category created successfully');
            expect(result.category).toEqual(mockCategory);
            console.log('✅ Tạo danh mục mới thành công');
        });

        it('should return error message when creation fails', async () => {
            const createData = {
                name: 'New Category',
                description: 'New Description',
            };
            mockCategoryRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result.message).toBe('Failed to create category');
            expect(result.category).toBeNull();
            console.log('✅ Xử lý lỗi khi tạo danh mục thất bại');
        });
    });

    describe('findAll', () => {
        it('should return categories with success message', async () => {
            const mockCategories = [
                createMockCategory({ name: 'Category 1' }),
                createMockCategory({ id: 2, name: 'Category 2' }),
            ];
            mockCategoryRepository.findAll.mockResolvedValue(mockCategories);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                size: 10,
            });
            expect(result.message).toBe('Categories fetched successfully');
            expect(result.categories).toEqual(mockCategories);
            console.log('✅ Lấy danh sách danh mục thành công');
        });

        it('should return no categories found message when empty', async () => {
            mockCategoryRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll({ page: 1, size: 10 });

            expect(result.message).toBe('No categories found');
            expect(result.categories).toEqual([]);
            console.log('✅ Không tìm thấy danh mục nào');
        });

        it('should use default pagination when not provided', async () => {
            const mockCategories = [createMockCategory()];
            mockCategoryRepository.findAll.mockResolvedValue(mockCategories);

            await service.findAll({});

            expect(mockCategoryRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                size: 10,
            });
            console.log('✅ Sử dụng phân trang mặc định khi không truyền vào');
        });
    });

    describe('findOne', () => {
        it('should return category when found', async () => {
            const categoryId = 1;
            const mockCategory = createMockCategory({ id: categoryId });
            mockCategoryRepository.findById.mockResolvedValue(mockCategory);

            const result = await service.findOne(categoryId);

            expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
            expect(result.message).toBe('Category fetched successfully');
            expect(result.category).toEqual(mockCategory);
            console.log('✅ Lấy danh mục theo ID thành công');
        });

        it('should throw NotFoundException when category not found', async () => {
            const categoryId = 999;
            mockCategoryRepository.findById.mockResolvedValue(null);

            try {
                await service.findOne(categoryId);
            } catch (e) {
                expect(e).toEqual(new NotFoundException('Category not found'));
                console.log('✅ Báo lỗi khi không tìm thấy danh mục theo ID');
            }
        });
    });

    describe('update', () => {
        it('should update category successfully', async () => {
            const categoryId = 1;
            const updateData = { name: 'Updated Category', description: 'Updated Description' };
            const updatedCategory = createMockCategory({ id: categoryId, ...updateData });

            mockCategoryRepository.update.mockResolvedValue(undefined);
            mockCategoryRepository.findById.mockResolvedValue(updatedCategory);

            const result = await service.update(categoryId, updateData);

            expect(mockCategoryRepository.update).toHaveBeenCalledWith(categoryId, updateData);
            expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
            expect(result.message).toBe('Category updated successfully');
            expect(result.category).toEqual(updatedCategory);
            console.log('✅ Cập nhật danh mục thành công');
        });

        it('should throw NotFoundException when category not found for update', async () => {
            const categoryId = 999;
            const updateData = { name: 'Updated Category' };

            mockCategoryRepository.update.mockResolvedValue(undefined);
            mockCategoryRepository.findById.mockResolvedValue(null);

            try {
                await service.update(categoryId, updateData);
            } catch (e) {
                expect(e).toEqual(new NotFoundException('Category not found'));
                console.log('✅ Báo lỗi khi cập nhật nhưng không tìm thấy danh mục');
            }
        });
    });

    describe('softDelete', () => {
        it('should delete category successfully', async () => {
            const categoryId = 1;
            const mockCategory = createMockCategory({ id: categoryId });

            mockCategoryRepository.findById.mockResolvedValue(mockCategory);
            mockCategoryRepository.softDelete.mockResolvedValue(undefined);

            const result = await service.softDelete(categoryId);

            expect(mockCategoryRepository.findById).toHaveBeenCalledWith(categoryId);
            expect(mockCategoryRepository.softDelete).toHaveBeenCalledWith(categoryId);
            expect(result.message).toBe('Category deleted successfully');
            console.log('✅ Xóa danh mục thành công');
        });

        it('should throw NotFoundException when category not found for deletion', async () => {
            const categoryId = 999;

            mockCategoryRepository.findById.mockResolvedValue(null);

            try {
                await service.softDelete(categoryId);
            } catch (e) {
                expect(e).toEqual(new NotFoundException('Category not found'));
                console.log('✅ Báo lỗi khi xóa nhưng không tìm thấy danh mục');
            }
        });
    });
});
