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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NewsService } from '@app/news';
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

    @Put('updatenews/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateNewsDto: UpdateNewsDto,
    ): Promise<NewsResponseDto[]> {
        const result = await this.newsService.update(Number(id), updateNewsDto);
        const dto = plainToInstance(NewsResponseDto, result.news, {
            excludeExtraneousValues: true,
        });
        if (dto.image_data && Buffer.isBuffer(dto.image_data)) {
            dto.image_data = dto.image_data.toString('base64');
        }
        return [dto];
    }

    @Delete('deletenews/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.newsService.softDelete(Number(id));
        return [result];
    }
}