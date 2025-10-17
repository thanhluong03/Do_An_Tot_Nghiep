import { NewsEntity, NewsRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateNews, IListNews, IUpdateNews } from './news.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class NewsService {
    constructor(
        private readonly newsRepository: NewsRepository,
    ) { }

    async create(data: ICreateNews): Promise<{ message: string, news: NewsEntity | null }> {
        try {
            const news = await this.newsRepository.create({
                title: data.title,
                content: data.content,
                published_at: new Date(),
                is_published: true,
                user_id: data.user_id,
                image_data: data.image_data,
            });
            return {
                message: 'News created successfully',
                news,
            };
        } catch (error) {
            return {
                message: 'Failed to create news',
                news: null,
            };
        }
    }

    async findAll(params: IListNews): Promise<{ message: string, news: NewsEntity[] }> {
        const news = await this.newsRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: news.length > 0 ? 'News fetched successfully' : 'No news found',
            news,
        };
    }

    async findOne(id: number): Promise<{ message: string, news: NewsEntity }> {
        const news = await this.newsRepository.findById(id);
        if (!news) throw new NotFoundException('News not found');
        return {
            message: 'News fetched successfully',
            news,
        };
    }

   async update(id: number, data: IUpdateNews): Promise<{ message: string, news: NewsEntity }> {
    try { // 👈 Thêm try...catch
        // Lỗi 500 thường xảy ra ở đây nếu Repository gặp vấn đề DB.
        await this.newsRepository.update(id, data);
        
        const news = await this.newsRepository.findById(id);
        if (!news) throw new NotFoundException('News not found');
        return {
            message: 'News updated successfully',
            news,
        };
    } catch (error) {
        // Ghi log lỗi chi tiết hơn để biết nguyên nhân thực sự
        console.error("Lỗi cập nhật tin tức (ID: " + id + "):", error);
        
        // Nếu không phải là NotFoundException đã xử lý, ném ra lỗi chung
        if (!(error instanceof NotFoundException)) {
            // Thay thế bằng InternalServerErrorException nếu bạn muốn một HTTP code rõ ràng hơn
            throw new Error('Database update failed or an unexpected error occurred.'); 
        }
        throw error; // Ném lại NotFoundException
    }
}

    async softDelete(id: number): Promise<{ message: string }> {
        const news = await this.newsRepository.findById(id);
        if (!news) throw new NotFoundException('News not found');
        await this.newsRepository.softDelete(id);
        return { message: 'News deleted successfully' };
    }
}
