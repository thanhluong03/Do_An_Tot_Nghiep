import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { OrderRepository, InventoryRepository, UserRepository, CustomerRepository } from '@app/database';
import { ICreateOrder, IUpdateOrder, IListOrder, IOrderItem } from './order.interface';
import { OrderEntity, OrderStatus, PaymentStatus, PaymentMethod } from '@app/database';
import { OrderStatusHistory, OrderStatusHistoryEntity, OrderStatusHistoryRepository, ActorChangeStatusOrderRepository } from '@app/database';
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
        @Inject(OrderStatusHistoryRepository)
        private readonly orderStatusHistoryRepository: OrderStatusHistoryRepository,
        @Inject(ActorChangeStatusOrderRepository)
        private readonly actorChangeStatusOrderRepository: ActorChangeStatusOrderRepository,
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        @Inject(CustomerRepository)
        private readonly customerRepository: CustomerRepository,
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

    async getOrderById(id: number): Promise<any> {
        const order = await this.orderRepository.findById(id);
        if (!order) return null;
        const statusHistoryRaw = await this.orderStatusHistoryRepository.getHistoryByOrderId(id);
        const statusHistory: any[] = [];
        for (const history of statusHistoryRaw) {
            const actorChange = await this.actorChangeStatusOrderRepository.findById(history.actor_id);
            let actorInfo: any = null;
            if (actorChange) {
                if (actorChange.user_id) {
                    const user = await this.userRepository.findById(actorChange.user_id);
                    let actorName = 'Người dùng';
                    if (user) {
                        if (user.full_name) actorName = user.full_name;
                        else if (user.username) actorName = user.username;
                    } else {
                        console.error('Không tìm thấy user với id:', actorChange.user_id);
                    }
                    actorInfo = {
                        user_id: actorChange.user_id,
                        name: actorName,
                        type: actorChange.actor_type,
                    };
                } else if (actorChange.customer_id) {
                    const customer = await this.customerRepository.findById(actorChange.customer_id);
                    let customerName = 'Khách hàng';
                    if (customer) {
                        if (customer.full_name) customerName = customer.full_name;
                        else if (customer.username) customerName = customer.username;
                    } else {
                        console.error('Không tìm thấy customer với id:', actorChange.customer_id);
                    }
                    actorInfo = {
                        customer_id: actorChange.customer_id,
                        name: customerName,
                        type: actorChange.actor_type,
                    };
                } else {
                    actorInfo = null;
                }
            }
            const { actor_id, ...restHistory } = history;
            statusHistory.push({
                ...restHistory,
                actor: actorInfo,
            });
        }
        return {
            ...order,
            statusHistory,
        };
    }

    async getOrders(params: IListOrder): Promise<OrderEntity[]> {
        return this.orderRepository.findAll(params);
    }

    async updateOrder(id: number, data: IUpdateOrder, user_id?: number, customer_id?: number, actor_type?: string): Promise<void> {
        const order = await this.orderRepository.findById(id);
        if (!order || (order as any).deleted_at) {
            throw new NotFoundException(`Order with id ${id} not found or has been deleted`);
        }
        const updateData: Partial<OrderEntity> = {};
        let statusChanged = false;
        if (data.status !== undefined && data.status !== order.status) {
            updateData.status = data.status;
            statusChanged = true;
        }
        if (data.payment_status !== undefined) updateData.payment_status = data.payment_status;
        if (data.shipping_address !== undefined) updateData.shipping_address = data.shipping_address;
        if (data.payment_method !== undefined) updateData.payment_method = data.payment_method;
        await this.orderRepository.update(id, updateData);
        if (statusChanged && updateData.status) {
            const actorChange = await this.actorChangeStatusOrderRepository.findOrCreateActor(
                user_id,
                customer_id,
                actor_type,
            );
            await this.orderStatusHistoryRepository.logStatusChange(
                id,
                updateData.status as unknown as OrderStatusHistory,
                actorChange.id
            );
        }
    }

    async deleteOrder(id: number): Promise<void> {
        await this.orderRepository.softDelete(id);
    }
}
