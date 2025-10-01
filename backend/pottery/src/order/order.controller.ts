import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OrderService } from '../../libs/order/src/order.service';
import type { CreateOrderDto, UpdateOrderDto } from './order.dto';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) { }

    @Post('createorder')
    async createOrder(@Body() body: CreateOrderDto) {
        return this.orderService.createOrder(body);
    }

    @Get('orderdetail/:id')
    async getOrder(@Param('id') id: number) {
        const order = await this.orderService.getOrderById(Number(id));
        return order ? order : [];
    }

    @Get('listorders')
    async getOrders(@Query('page') page = 1, @Query('size') size = 10, @Query('key') key?: string) {
        const orders = await this.orderService.getOrders({ page: Number(page), size: Number(size), key });
        return Array.isArray(orders) ? orders : [];
    }

    @Get('customer/:customer_id')
    async getOrdersByCustomer(@Param('customer_id') customer_id: number, @Query('page') page = 1, @Query('size') size = 10) {
        const orders = await this.orderService.getOrders({ page: Number(page), size: Number(size), customer_id: Number(customer_id) });
        return Array.isArray(orders) ? orders : [];
    }

    @Put('updateorder/:id')
    async updateOrder(@Param('id') id: number, @Body() body: UpdateOrderDto) {
        await this.orderService.updateOrder(Number(id), body);
        return { message: 'Order updated successfully' };
    }

    @Delete('deleteorder/:id')
    async deleteOrder(@Param('id') id: number) {
        await this.orderService.deleteOrder(Number(id));
        return { message: 'Order deleted successfully' };
    }
}
