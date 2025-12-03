import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { OrderService } from '../../libs/order/src/order.service';
import { CreateOrderDto, UpdateOrderDto, SuccessResponseDto, ErrorResponseDto } from './order.dto';
import { OrderStatus, PaymentStatus } from '../../libs/database/src/entities/order.entity';
import { Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('createorder')
    async createOrder(@Body() body: CreateOrderDto) {
        try {
            const order = await this.orderService.createOrder(body);
            return new SuccessResponseDto('Order created successfully', order);
        } catch (error: any) {
            return new ErrorResponseDto(
                'Failed to create order',
                error && typeof error === 'object' && 'message' in error
                    ? error.message
                    : error,
            );
        }
    }

    @Get('orderdetail/:id')
    async getOrder(@Param('id') id: number) {
        try {
            const order = await this.orderService.getOrderById(Number(id));
            if (order) {
                return new SuccessResponseDto('Order fetched successfully', order);
            } else {
                return new ErrorResponseDto('Order not found');
            }
        } catch (error: any) {
            return new ErrorResponseDto(
                'Failed to fetch order',
                error && typeof error === 'object' && 'message' in error
                    ? error.message
                    : error,
            );
        }
    }

    // @Get('listorders')
    // async getOrders(@Query('page') page = 1, @Query('size') size = 10, @Query('key') key?: string) {
    //     try {
    //         const orders = await this.orderService.getOrders({ page: Number(page), size: Number(size), key });
    //         return new SuccessResponseDto('Orders fetched successfully', Array.isArray(orders) ? orders : []);
    //     } catch (error: any) {
    //         return new ErrorResponseDto(
    //             'Failed to fetch orders',
    //             error && typeof error === 'object' && 'message' in error
    //                 ? error.message
    //                 : error,
    //         );
    //     }
    // }
    @Get('listorders')
    async getOrders(
        @Query('page') page = 1,
        @Query('size') size = 10,
        @Query('key') key?: string,
        @Query('store_id') store_id?: number,
        @Query('status') status?: string,
        @Query('payment_status') payment_status?: string,
        @Query('start_date') start_date?: string,
        @Query('end_date') end_date?: string
    ) {
        try {
            const { orders, total, totalByStatus } = await this.orderService.getOrders({
                page: Number(page),
                size: Number(size),
                key,
                store_id: store_id ? Number(store_id) : undefined,
                status: status as OrderStatus,
                payment_status: payment_status as PaymentStatus,
                start_date,
                end_date,
            });
            return new SuccessResponseDto('Orders fetched successfully', {
                data: Array.isArray(orders) ? orders : [],
                total: total,
                totalByStatus,
            });
        } catch (error: any) {
            return new ErrorResponseDto(
                'Failed to fetch orders',
                error && typeof error === 'object' && 'message' in error
                    ? error.message
                    : error,
            );
        }
    }
    @Get('customer/:customer_id')
    async getOrdersByCustomer(@Param('customer_id') customer_id: number, @Query('page') page = 1, @Query('size') size = 10) {
        try {
            const { orders, total } = await this.orderService.getOrders({
                page: Number(page),
                size: Number(size),
                customer_id: Number(customer_id)
            });

            return new SuccessResponseDto('Orders fetched successfully', {
                data: Array.isArray(orders) ? orders : [],
                total: total,
            });
        } catch (error: any) {
            return new ErrorResponseDto(
                'Failed to fetch orders',
                error && typeof error === 'object' && 'message' in error
                    ? error.message
                    : error,
            );
        }
    }

    @Put('updateorder/:id')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'reason_change_images' },
        { name: 'cancel_reason_images' },
        { name: 'delivery_fail_images' }
    ]))
    async updateOrder(
        @Param('id') id: number,
        @Body() body: UpdateOrderDto,
        @UploadedFiles() files: { reason_change_images?: Express.Multer.File[], cancel_reason_images?: Express.Multer.File[], delivery_fail_images?: Express.Multer.File[] }
    ) {
        try {
            const reasonChangeImages = files?.reason_change_images?.map(f => f.buffer) ?? [];
            const cancelReasonImages = files?.cancel_reason_images?.map(f => f.buffer) ?? [];
            const deliveryFailImages = files?.delivery_fail_images?.map(f => f.buffer) ?? [];

            await this.orderService.updateOrder(
                Number(id),
                {
                    ...body,
                    reason_change_images: reasonChangeImages.length > 0 ? reasonChangeImages : undefined,
                    cancel_reason_images: cancelReasonImages.length > 0 ? cancelReasonImages : undefined,
                    delivery_fail_images: deliveryFailImages.length > 0 ? deliveryFailImages : undefined,
                },
                body.user_id,
                body.customer_id,
                body.actor_type
            );
            return new SuccessResponseDto('Order updated successfully');
        } catch (error: any) {
            return new ErrorResponseDto(
                'Failed to update order',
                error && typeof error === 'object' && 'message' in error
                    ? error.message
                    : error,
            );
        }
    }

    @Delete('deleteorder/:id')
    async deleteOrder(@Param('id') id: number) {
        try {
            await this.orderService.deleteOrder(Number(id));
            return new SuccessResponseDto('Order deleted successfully');
        } catch (error: any) {
            return new ErrorResponseDto(
                'Failed to delete order',
                error && typeof error === 'object' && 'message' in error
                    ? error.message
                    : error,
            );
        }
    }

    @Get('export-excel')
    async exportOrdersToExcel(@Res() res: Response) {
        await this.orderService.exportOrdersToExcel(res);
    }

    @Get('store/:store_id')
    async getOrdersByStore(@Param('store_id') store_id: number, @Query('page') page = 1, @Query('size') size = 10) {
        try {
            const { orders, total, totalByStatus } = await this.orderService.getOrdersByStore(Number(store_id), Number(page), Number(size));
            return new SuccessResponseDto('Orders fetched successfully', {
                data: Array.isArray(orders) ? orders : [],
                total: total,
                totalByStatus,
            });
        } catch (error: any) {
            return new ErrorResponseDto(
                'Failed to fetch orders',
                error && typeof error === 'object' && 'message' in error
                    ? error.message
                    : error,
            );
        }
    }
}
