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
import { FilesInterceptor } from '@nestjs/platform-express';
import { ReviewService } from '@app/review';
import {
    CreateReviewDto,
    UpdateReviewDto,
    ListReviewRequestDto,
    ReviewResponseDto,
} from './review.dto';
import { plainToInstance } from 'class-transformer';

@Controller('reviews')
export class ReviewController {
    @Get('by-product/:productId')
    async getReviewsByProduct(@Param('productId') productId: number) {
        const result = await this.reviewService.findByProductId(Number(productId));
        return result.reviews.map((review: any) => ({
            ...review
        }));
    }
    constructor(private readonly reviewService: ReviewService) { }

    @Post('createreview')
    @UseInterceptors(FilesInterceptor('images'))
    async createMany(
        @Body() createReviewDto: CreateReviewDto | CreateReviewDto[],
        @UploadedFiles() images: Express.Multer.File[],
    ): Promise<any> {
        try {
            if (Array.isArray(createReviewDto)) {
                // Group images by fieldname: images_0, images_1, ...
                const imagesMap: { [key: string]: Buffer[] } = {};
                if (images && images.length > 0) {
                    for (const file of images) {
                        // fieldname: images_0, images_1, ...
                        if (!imagesMap[file.fieldname]) imagesMap[file.fieldname] = [];
                        imagesMap[file.fieldname].push(file.buffer);
                    }
                }
                // Gán đúng ảnh cho từng review
                createReviewDto.forEach((dto, idx) => {
                    const key = `images_${idx}`;
                    if (imagesMap[key]) {
                        dto.images = imagesMap[key];
                    } else {
                        dto.images = [];
                    }
                });
                const results = await Promise.all(
                    createReviewDto.map(dto => this.reviewService.create(dto))
                );
                const response = results
                    .filter(result => result.review)
                    .map(result => {
                        const dto = plainToInstance(ReviewResponseDto, result.review, {
                            excludeExtraneousValues: true,
                        });
                        const reviewAny = result.review as any;
                        return {
                            ...dto,
                            message: result.message,
                            image_review: reviewAny.image_review || [],
                            image_count: reviewAny.image_review?.length || 0,
                        };
                    });
                return {
                    success: true,
                    message: `Đã tạo ${response.length} review thành công!`,
                    reviews: response.map(r => ({
                        ...r,
                        images: Array.isArray(r.image_review)
                            ? r.image_review.map(img => ({
                                id: img.id,
                                image_data: img.image_review ? Buffer.isBuffer(img.image_review) ? img.image_review.toString('base64') : img.image_review : null
                            }))
                            : [],
                    })),
                };
            } else {
                // Nếu là object (1 review), gán toàn bộ images
                if (images && images.length > 0) {
                    createReviewDto.images = images.map(file => file.buffer);
                }
                const result = await this.reviewService.create(createReviewDto);
                const reviewAny = result.review as any;
                return {
                    success: true,
                    message: result.message,
                    id: reviewAny.id,
                    rating: reviewAny.rating,
                    comment: reviewAny.comment,
                    customer_id: reviewAny.customer_id,
                    orderitem_id: reviewAny.orderitem_id,
                    created_at: reviewAny.created_at,
                    updated_at: reviewAny.updated_at,
                    images: Array.isArray(reviewAny.image_review)
                        ? reviewAny.image_review.map(img => ({
                            id: img.id,
                            image_data: img.image_review ? Buffer.isBuffer(img.image_review) ? img.image_review.toString('base64') : img.image_review : null
                        }))
                        : []
                };
            }
        } catch (error) {
            return {
                success: false,
                message: 'Review creation failed',
                error: error.message,
            };
        }
    }

    @Get('listreview')
    async findAll(@Query() query: ListReviewRequestDto) {
        const result = await this.reviewService.findAll(query);
        // Map images to {id, image_data} for each review
        return result.reviews.map((review: any) => ({
            ...review
        }));
    }

    @Get('reviewdetail/:id')
    async findOne(@Param('id') id: number): Promise<ReviewResponseDto[]> {
        const result = await this.reviewService.findOne(Number(id));
        return [{
            ...plainToInstance(ReviewResponseDto, result.review, {
                excludeExtraneousValues: true,
            }),
        }];
    }

    @Put('updatereview/:id')
    @UseInterceptors(FilesInterceptor('images'))
    async updateOne(
        @Param('id') id: number,
        @Body() updateReviewDto: UpdateReviewDto,
        @UploadedFiles() images: Express.Multer.File[],
    ): Promise<ReviewResponseDto[]> {
        try {
            if (images && images.length > 0) {
                updateReviewDto.images = images.map(file => file.buffer);
            }
            const result = await this.reviewService.update(Number(id), updateReviewDto);
            const reviewAny = result.review as any;
            // Always return required fields for ReviewResponseDto
            return [{
                success: true,
                message: result.message,
                id: reviewAny.id,
                rating: reviewAny.rating,
                comment: reviewAny.comment,
                customer_id: reviewAny.customer_id,
                orderitem_id: reviewAny.orderitem_id,
                created_at: reviewAny.created_at,
                updated_at: reviewAny.updated_at,
                images: Array.isArray(reviewAny.image_review)
                    ? reviewAny.image_review.map(img => ({
                        id: img.id,
                        image_data: img.image_review ? Buffer.isBuffer(img.image_review) ? img.image_review.toString('base64') : img.image_review : null
                    }))
                    : [],
            }];
        } catch (error) {
            return [{
                success: false,
                message: 'Review update failed',
                error: error.message,
            }];
        }
    }

    @Delete('deletereview/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.reviewService.softDelete(Number(id));
        return [result];
    }
}