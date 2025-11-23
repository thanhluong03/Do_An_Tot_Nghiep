import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { NewsRepository, NewsEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { ICreateNews, IListNews, IUpdateNews } from './news.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

describe('NewsService', () => {
    let service: NewsService;
    let mockNewsRepository: jest.Mocked<NewsRepository>;

    const mockNews: NewsEntity = {
        id: 1,
        title: 'Test News',
        content: 'Test Content',
        published_at: new Date(),
        is_published: true,
        user_id: 1,
        image_data: Buffer.from('test-image'),
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        user: undefined,
    } as NewsEntity;

    beforeEach(async () => {
        const mockNewsRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NewsService,
                { provide: NewsRepository, useValue: mockNewsRepo },
            ],
        }).compile();

        service = module.get<NewsService>(NewsService);
        mockNewsRepository = module.get(NewsRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        const createData: ICreateNews = {
            title: 'New News',
            content: 'New Content',
            user_id: 1,
            image_data: Buffer.from('test-image'),
        };

        it('should create news successfully', async () => {
            console.log('Tạo news thành công');
            const createdNews = { ...mockNews, ...createData };
            mockNewsRepository.create.mockResolvedValue(createdNews);

            const result = await service.create(createData);

            expect(result).toEqual({
                message: 'News created successfully',
                news: createdNews,
            });
            expect(mockNewsRepository.create).toHaveBeenCalledWith({
                title: createData.title,
                content: createData.content,
                published_at: expect.any(Date),
                is_published: true,
                user_id: createData.user_id,
                image_data: createData.image_data,
            });
        });

        it('should handle creation errors', async () => {
            console.log('Xử lý lỗi khi tạo news');
            mockNewsRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result).toEqual({
                message: 'Failed to create news',
                news: null,
            });
        });
    });

    describe('findAll', () => {
        const listParams: IListNews = {
            page: 1,
            size: 10,
        };

        it('should return news with success message', async () => {
            console.log('Lấy danh sách news thành công');
            const newsList = [mockNews];
            mockNewsRepository.findAll.mockResolvedValue(newsList);

            const result = await service.findAll(listParams);

            expect(result).toEqual({
                message: 'News fetched successfully',
                news: newsList,
            });
            expect(mockNewsRepository.findAll).toHaveBeenCalledWith(listParams);
        });

        it('should use default pagination when not provided', async () => {
            console.log('Sử dụng phân trang mặc định khi không truyền tham số');
            mockNewsRepository.findAll.mockResolvedValue([]);

            await service.findAll({});

            expect(mockNewsRepository.findAll).toHaveBeenCalledWith({
                size: DEFAULT_PAGE_SIZE,
                page: DEFAULT_PAGE,
            });
        });

        it('should return no news found message when empty', async () => {
            console.log('Không tìm thấy news nào');
            mockNewsRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll(listParams);

            expect(result).toEqual({
                message: 'No news found',
                news: [],
            });
        });
    });

    describe('findOne', () => {
        it('should return news when found', async () => {
            console.log('Tìm thấy news theo id');
            mockNewsRepository.findById.mockResolvedValue(mockNews);

            const result = await service.findOne(1);

            expect(result).toEqual({
                message: 'News fetched successfully',
                news: mockNews,
            });
            expect(mockNewsRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when news not found', async () => {
            console.log('Không tìm thấy news theo id, trả về NotFoundException');
            mockNewsRepository.findById.mockResolvedValue(null);

            await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
            expect(mockNewsRepository.findById).toHaveBeenCalledWith(1);
        });
    });

    describe('update', () => {
        const updateData: IUpdateNews = {
            title: 'Updated News',
            content: 'Updated Content',
        };

        it('should update news successfully', async () => {
            console.log('Cập nhật news thành công');
            const updatedNews = { ...mockNews, ...updateData };
            mockNewsRepository.update.mockResolvedValue(undefined);
            mockNewsRepository.findById.mockResolvedValue(updatedNews);

            const result = await service.update(1, updateData);

            expect(result).toEqual({
                message: 'News updated successfully',
                news: updatedNews,
            });
            expect(mockNewsRepository.update).toHaveBeenCalledWith(1, updateData);
        });

        it('should throw NotFoundException when news not found after update', async () => {
            console.log('Không tìm thấy news sau khi cập nhật, trả về NotFoundException');
            mockNewsRepository.update.mockResolvedValue(undefined);
            mockNewsRepository.findById.mockResolvedValue(null);

            await expect(service.update(1, updateData)).rejects.toThrow(NotFoundException);
        });

        it('should handle database update errors', async () => {
            console.log('Lỗi database khi cập nhật news');
            mockNewsRepository.update.mockRejectedValue(new Error('Database error'));

            await expect(service.update(1, updateData)).rejects.toThrow('Database update failed or an unexpected error occurred.');
        });

        it('should re-throw NotFoundException from repository', async () => {
            console.log('Repository trả về NotFoundException khi cập nhật');
            const notFoundError = new NotFoundException('News not found');
            mockNewsRepository.update.mockRejectedValue(notFoundError);

            await expect(service.update(1, updateData)).rejects.toThrow(NotFoundException);
        });
    });

    describe('softDelete', () => {
        it('should delete news successfully', async () => {
            console.log('Xóa news thành công');
            mockNewsRepository.findById.mockResolvedValue(mockNews);
            mockNewsRepository.softDelete.mockResolvedValue(undefined);

            const result = await service.softDelete(1);

            expect(result).toEqual({
                message: 'News deleted successfully',
            });
            expect(mockNewsRepository.findById).toHaveBeenCalledWith(1);
            expect(mockNewsRepository.softDelete).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when news not found for deletion', async () => {
            console.log('Không tìm thấy news để xóa, trả về NotFoundException');
            mockNewsRepository.findById.mockResolvedValue(null);

            await expect(service.softDelete(1)).rejects.toThrow(NotFoundException);
            expect(mockNewsRepository.findById).toHaveBeenCalledWith(1);
            expect(mockNewsRepository.softDelete).not.toHaveBeenCalled();
        });
    });
});
