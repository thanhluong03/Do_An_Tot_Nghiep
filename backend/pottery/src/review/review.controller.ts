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
import { ReviewService } from '@app/review';
import {
    CreateReviewDto,
    UpdateReviewDto,
    ListReviewRequestDto,
    ReviewResponseDto,
} from './review.dto';
import { plainToInstance } from 'class-transformer';
import { ListSupplierRequestDto, SupplierResponseDto, UpdateSupplierDto } from 'src/supplier/supplier.dto';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Post('createreview')
    async createMany(
        @Body() createReviewDtos: CreateReviewDto[],
    ): Promise<ReviewResponseDto[]> {
        const results = await Promise.all(
            createReviewDtos.map(dto => this.reviewService.create(dto))
        );
        return results.map(result =>
            plainToInstance(ReviewResponseDto, result.review, {
                excludeExtraneousValues: true,
            })
        );
    }

    @Get('listreview')
    async findAll(@Query() query: ListReviewRequestDto): Promise<ReviewResponseDto[]> {
        const result = await this.reviewService.findAll(query);
        return result.reviews.map(review =>
            plainToInstance(ReviewResponseDto, review, {
                excludeExtraneousValues: true,
            }),
        );
    }

    @Get('reviewdetail/:id')
    async findOne(@Param('id') id: number): Promise<ReviewResponseDto[]> {
        const result = await this.reviewService.findOne(Number(id));
        return [
            plainToInstance(ReviewResponseDto, result.review, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Put('updatereview/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateReviewDto: UpdateReviewDto,
    ): Promise<ReviewResponseDto[]> {
        const result = await this.reviewService.update(Number(id), updateReviewDto);
        return [
            plainToInstance(ReviewResponseDto, result.review, {
                excludeExtraneousValues: true,
            })
        ];
    }

    @Delete('deletereview/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.reviewService.softDelete(Number(id));
        return [result];
    }
}