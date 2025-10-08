import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { OrderRepository, InventoryRepository } from '@app/database';
import { ICreateOrder, IUpdateOrder, IListOrder, IOrderItem } from './order.interface';
import { OrderEntity, OrderStatus, PaymentStatus, PaymentMethod } from '@app/database';
import { CategoryRepository } from '@app/database';

@Injectable()
export class OrderService {
    constructor(
        @Inject(OrderRepository)
        private readonly orderRepository: OrderRepository,
        @Inject(InventoryRepository)
        private readonly inventoryRepository: InventoryRepository,
        @Inject(CategoryRepository)
        private readonly categoryRepository: CategoryRepository,
    ) { }

    async createOrder(data: ICreateOrder): Promise<OrderEntity> {
        const { items, status, payment_status, payment_method, ...orderData } = data;
        const enrichedItems: IOrderItem[] = [];
        let total_amount = 0;
        for (const item of items) {
            const inventory = await this.inventoryRepository.findByProductAndStore(
                item.product_id,
                item.store_id,
            );
            if (!inventory) {
                throw new NotFoundException(
                    `Không tìm thấy tồn kho cho sản phẩm ${item.product_id} tại cửa hàng ${item.store_id}`,
                );
            }
            if (inventory.quantity_stock < item.quantity) {
                throw new NotFoundException(
                    `Số lượng tồn kho không đủ cho sản phẩm ${item.product_id} tại cửa hàng ${item.store_id}`,
                );
            }
            const product = inventory.product;
            const store = inventory.store;
            let categoryName: string | undefined = undefined;
            if (product && product.category_id) {
                const category = await this.categoryRepository.findById(
                    product.category_id,
                );
                categoryName = category?.name;
            }
            enrichedItems.push({
                ...item,
                product_name: product?.name,
                description: product?.description,
                price: product?.price,
                category_id: product?.category_id,
                category_name: categoryName,
                store_name: store?.store_name,
                store_address: store?.address,
            });
            total_amount += item.price_at_order * item.quantity;
            inventory.quantity_stock -= item.quantity;
            inventory.quantity_sold = (inventory.quantity_sold || 0) + item.quantity;
            await this.inventoryRepository.create(inventory);
        }
        const current_order = {
            ...orderData,
            items: enrichedItems,
            total_amount,
            status: status ?? OrderStatus.CREATED,
            payment_status: payment_status ?? PaymentStatus.UNPAID,
            payment_method: payment_method ?? PaymentMethod.ONSITE,
            order_date: new Date()
        };
        const order = await this.orderRepository.createOrder(
            {
                ...orderData,
                total_amount,
                status: status ?? OrderStatus.CREATED,
                payment_status: payment_status ?? PaymentStatus.UNPAID,
                payment_method: payment_method ?? PaymentMethod.ONSITE,
                current_order
            },
            items
        );
        return order;
    }

    async getOrderById(id: number): Promise<OrderEntity | null> {
        return this.orderRepository.findById(id);
    }

    async getOrders(params: IListOrder): Promise<OrderEntity[]> {
        return this.orderRepository.findAll(params);
    }

    async updateOrder(id: number, data: IUpdateOrder): Promise<void> {
        const order = await this.orderRepository.findById(id);
        if (!order || (order as any).deleted_at) {
            throw new NotFoundException(`Order with id ${id} not found or has been deleted`);
        }
        const updateData: Partial<OrderEntity> = {};
        if (data.status !== undefined) updateData.status = data.status;
        if (data.payment_status !== undefined) updateData.payment_status = data.payment_status;
        if (data.shipping_address !== undefined) updateData.shipping_address = data.shipping_address;
        if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;
        await this.orderRepository.update(id, updateData);
    }

    async deleteOrder(id: number): Promise<void> {
        await this.orderRepository.softDelete(id);
    }
}
