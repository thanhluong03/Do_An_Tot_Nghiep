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
    async createMany(
        @Body() createNewsDtos: CreateNewsDto[],
    ): Promise<NewsResponseDto[]> {
        const results = await Promise.all(
            createNewsDtos.map(dto => this.newsService.create(dto))
        );
        return results.map(result =>
            plainToInstance(NewsResponseDto, result.news, {
                excludeExtraneousValues: true,
            })
        );
    }

    @Get('listnews')
    async findAll(@Query() query: ListNewsRequestDto): Promise<NewsResponseDto[]> {
        const result = await this.newsService.findAll(query);
        return result.news.map(news =>
            plainToInstance(NewsResponseDto, news, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('newsdetail/:id')
    async findOne(@Param('id') id: number): Promise<NewsResponseDto[]> {
        const result = await this.newsService.findOne(Number(id));
        return [
            plainToInstance(NewsResponseDto, result.news, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updatenews/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateNewsDto: UpdateNewsDto,
    ): Promise<NewsResponseDto[]> {
        const result = await this.newsService.update(Number(id), updateNewsDto);
        return [
            plainToInstance(NewsResponseDto, result.news, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Delete('deletenews/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.newsService.softDelete(Number(id));
        return [result];
    }
}