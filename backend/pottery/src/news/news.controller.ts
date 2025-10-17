import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    UploadedFiles,
    UseInterceptors,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';

import { NewsService } from '@app/news';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
    CreateNewsDto,
    UpdateNewsDto,
    ListNewsRequestDto,
    NewsResponseDto,
} from './news.dto';
import { plainToInstance } from 'class-transformer';

@Controller('news')
export class NewsController {
    constructor(private readonly newsService: NewsService) { }
    @Post('createnews')
    @UseInterceptors(FilesInterceptor('image_data'))
    async createManyNews(
        @Body('title') titles: string | string[],
        @Body('content') contents: string | string[],
        @Body('user_id') user_ids: string | string[],
        @UploadedFiles() images?: Express.Multer.File[],
    ): Promise<NewsResponseDto[]> {
        const arrTitles = Array.isArray(titles) ? titles : [titles];
        const arrContents = Array.isArray(contents) ? contents : [contents];
        const arrUserIds = Array.isArray(user_ids) ? user_ids : [user_ids];
        const arrImages = images || [];
        const newsDtos: CreateNewsDto[] = arrTitles.map((title, idx) => ({
            title,
            content: arrContents[idx],
            user_id: Number(arrUserIds[idx]),
            image_data: arrImages[idx]?.buffer,
        }));
        const results = await Promise.all(
            newsDtos.map((dto) => this.newsService.create(dto)),
        );
        return results.map((result) => {
            const dto = plainToInstance(NewsResponseDto, result.news, {
                excludeExtraneousValues: true,
            });
            if (dto.image_data && Buffer.isBuffer(dto.image_data)) {
                dto.image_data = dto.image_data.toString('base64');
            }
            return dto;
        });
    }

    @Get('listnews')
    async findAll(@Query() query: ListNewsRequestDto): Promise<NewsResponseDto[]> {
        const result = await this.newsService.findAll(query);
        return result.news.map((news) => {
            const dto = plainToInstance(NewsResponseDto, news, {
                excludeExtraneousValues: true,
            });
            if (dto.image_data && Buffer.isBuffer(dto.image_data)) {
                dto.image_data = dto.image_data.toString('base64');
            }
            return dto;
        });
    }

    @Get('newsdetail/:id')
    async findOne(@Param('id') id: number): Promise<NewsResponseDto[]> {
        const result = await this.newsService.findOne(Number(id));
        const dto = plainToInstance(NewsResponseDto, result.news, {
            excludeExtraneousValues: true,
        });
        if (dto.image_data && Buffer.isBuffer(dto.image_data)) {
            dto.image_data = dto.image_data.toString('base64');
        }
        return [dto];
    }

    // @Put('updatenews/:id')
    // async updateOne(
    //     @Param('id') id: number,
    //     @Body() updateNewsDto: UpdateNewsDto,
    // ): Promise<NewsResponseDto[]> {
    //     const result = await this.newsService.update(Number(id), updateNewsDto);
    //     const dto = plainToInstance(NewsResponseDto, result.news, {
    //         excludeExtraneousValues: true,
    //     });
    //     if (dto.image_data && Buffer.isBuffer(dto.image_data)) {
    //         dto.image_data = dto.image_data.toString('base64');
    //     }
    //     return [dto];
    // }
    @Put('updatenews/:id')
@UseInterceptors(FilesInterceptor('image_data')) 
async updateOne(
    @Param('id') id: number,
    @Body() body: any, // Nhận tất cả các trường non-file dưới dạng chuỗi
    @UploadedFiles() images?: Express.Multer.File[], // Nhận file ảnh
): Promise<NewsResponseDto[]> {
    
    if (Object.keys(body).length === 0 && (!images || images.length === 0)) {
        throw new BadRequestException('Dữ liệu cập nhật không được bỏ trống.');
    }

    try {
        // 2. Khởi tạo đối tượng DTO rỗng
        const updateNewsDto: UpdateNewsDto = {}; 
        
        // 3. Chỉ gán các trường nếu chúng tồn tại trong Body
        
        // Tiêu đề
        if (body.title !== undefined) {
            updateNewsDto.title = String(body.title).trim();
        }
        
        // Nội dung
        if (body.content !== undefined) {
            updateNewsDto.content = String(body.content).trim();
        }

        // is_published (chuyển đổi string sang boolean)
        if (body.is_published !== undefined) {
            updateNewsDto.is_published = (body.is_published === 'true' || body.is_published === '1');
        }
        
        // user_id (chuyển đổi string sang number)
        if (body.user_id !== undefined && !isNaN(Number(body.user_id))) {
            updateNewsDto.user_id = Number(body.user_id);
        } 
        
        // 4. Xử lý file (image_data)
        if (images && images.length > 0) {
            updateNewsDto.image_data = images[0].buffer;
        }

        // 5. Kiểm tra DTO rỗng sau khi xử lý (Logic này vẫn cần)
        if (Object.keys(updateNewsDto).length === 0) {
            // Nếu không có gì để cập nhật, chỉ cần trả về bản ghi hiện tại
            const existingNews = await this.newsService.findOne(Number(id));
            return [plainToInstance(NewsResponseDto, existingNews.news)];
        }


        // 6. Gọi Service
        const result = await this.newsService.update(Number(id), updateNewsDto);
        
        // 7. Xử lý response (Giữ nguyên)
        const dto = plainToInstance(NewsResponseDto, result.news, {
            excludeExtraneousValues: true,
        });
        if (dto.image_data && Buffer.isBuffer(dto.image_data)) {
            dto.image_data = dto.image_data.toString('base64');
        }
        return [dto];
    } catch (error) {
        console.error("LỖI UPDATE TIN TỨC:", error);
        throw new InternalServerErrorException('Lỗi máy chủ trong quá trình cập nhật dữ liệu. Vui lòng kiểm tra log server.');
    }
}

    @Delete('deletenews/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.newsService.softDelete(Number(id));
        return [result];
    }
}