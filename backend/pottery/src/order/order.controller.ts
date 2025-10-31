import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
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
            const { orders, total } = await this.orderService.getOrders({
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
    async updateOrder(@Param('id') id: number, @Body() body: UpdateOrderDto) {
        try {
            await this.orderService.updateOrder(
                Number(id),
                body,
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
}
