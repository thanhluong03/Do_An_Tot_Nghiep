import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OrderService } from '../../libs/order/src/order.service';
import { CreateOrderDto, UpdateOrderDto, SuccessResponseDto, ErrorResponseDto } from './order.dto';

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

    @Get('listorders')
    async getOrders(@Query('page') page = 1, @Query('size') size = 10, @Query('key') key?: string) {
        try {
            const orders = await this.orderService.getOrders({ page: Number(page), size: Number(size), key });
            return new SuccessResponseDto('Orders fetched successfully', Array.isArray(orders) ? orders : []);
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
            const orders = await this.orderService.getOrders({ page: Number(page), size: Number(size), customer_id: Number(customer_id) });
            return new SuccessResponseDto('Orders fetched successfully', Array.isArray(orders) ? orders : []);
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
            await this.orderService.updateOrder(Number(id), body);
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
}
