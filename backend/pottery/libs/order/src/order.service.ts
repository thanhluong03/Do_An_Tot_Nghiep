import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { OrderRepository, InventoryRepository, UserRepository, CustomerRepository, ProductImageRepository } from '@app/database';
import { ProductRepository } from '@app/database';
import { ICreateOrder, IUpdateOrder, IListOrder, IOrderItem } from './order.interface';
import { OrderEntity, OrderStatus, PaymentStatus, PaymentMethod } from '@app/database';
import { OrderStatusHistory, OrderStatusHistoryEntity, OrderStatusHistoryRepository } from '@app/database';
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
        @Inject(UserRepository)
        private readonly userRepository: UserRepository,
        @Inject(CustomerRepository)
        private readonly customerRepository: CustomerRepository,
        @Inject(ProductImageRepository)
        private readonly productImageRepository: ProductImageRepository,
        @Inject(ProductRepository)
        private readonly productRepository: ProductRepository,
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
            if (product && typeof product.quantity === 'number') {
                if (product.quantity < item.quantity) {
                    throw new NotFoundException(
                        `Số lượng sản phẩm tổng không đủ cho sản phẩm ${item.product_id}`,
                    );
                }
                product.quantity -= item.quantity;
                await this.productRepository.update(product.id, { quantity: product.quantity });
            }
            let categoryName: string | undefined = undefined;
            if (product && product.category_id) {
                const category = await this.categoryRepository.findById(
                    product.category_id,
                );
                categoryName = category?.name;
            }
            let product_images: any[] = [];
            if (product?.id) {
                const images = await this.productImageRepository.findByProductId(product.id);
                product_images = images.map((img: any) => ({
                    id: img.id,
                    image_data: img.image_data ? img.image_data.toString('base64') : null,
                    is_main_image: img.is_main_image ?? false,
                    priority: img.priority ?? 0,
                }));
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
                product_images,
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
        if (order && order.id) {
            const orderItems = await this.orderRepository.getOrderItemsByOrderId(order.id);
            for (let i = 0; i < current_order.items.length; i++) {
                if (orderItems[i] && orderItems[i].id) {
                    (current_order.items[i] as any).orderitem_id = orderItems[i].id;
                }
            }
            await this.orderRepository.update(order.id, { current_order });
        }
        return order;
    }

    async getOrderById(id: number): Promise<any> {
        const order = await this.orderRepository.findById(id);
        if (!order) return null;
        let itemsWithImages: any[] = [];
        const currentOrder: any = order.current_order as any;
        if (currentOrder?.items && Array.isArray(currentOrder.items)) {
            itemsWithImages = await Promise.all(currentOrder.items.map(async (item: any) => {
                let product_images = item.product_images;
                if (!product_images || !Array.isArray(product_images) || product_images.length === 0) {
                    const images = await this.productImageRepository.findByProductId(item.product_id);
                    product_images = images.map((img: any) => ({
                        id: img.id,
                        image_data: img.image_data ? img.image_data.toString('base64') : null,
                        is_main_image: img.is_main_image ?? false,
                        priority: img.priority ?? 0,
                    }));
                } else {
                    product_images = product_images.map((img: any) => ({
                        ...img,
                        image_data: img.image_data && Buffer.isBuffer(img.image_data)
                            ? img.image_data.toString('base64')
                            : img.image_data,
                    }));
                }
                const main_image = product_images.find((img: any) => img.is_main_image) || null;
                return {
                    ...item,
                    product_images,
                    main_image,
                };
            }));
        }
        const statusHistoryRaw = await this.orderStatusHistoryRepository.getHistoryByOrderId(id);
        const statusHistory: any[] = [];
        for (const history of statusHistoryRaw) {
            let actorInfo: any = null;
            if (history.user_id) {
                const user = await this.userRepository.findById(history.user_id);
                let userName = 'Người dùng';
                if (user) {
                    if (user.full_name) userName = user.full_name;
                    else if (user.username) userName = user.username;
                } else {
                    console.error('Không tìm thấy user với id:', history.user_id);
                }
                actorInfo = {
                    user_id: history.user_id,
                    name: userName,
                };
            } else if (history.customer_id) {
                const customer = await this.customerRepository.findById(history.customer_id);
                let customerName = 'Khách hàng';
                if (customer) {
                    if (customer.full_name) customerName = customer.full_name;
                    else if (customer.username) customerName = customer.username;
                } else {
                    console.error('Không tìm thấy customer với id:', history.customer_id);
                }
                actorInfo = {
                    customer_id: history.customer_id,
                    name: customerName,
                };
            } else {
                actorInfo = null;
            }
            const { user_id, customer_id, ...restHistory } = history;
            statusHistory.push({
                ...restHistory,
                actor: actorInfo,
            });
        }
        return {
            ...order,
            current_order: {
                ...order.current_order,
                items: itemsWithImages,
            },
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
            await this.orderStatusHistoryRepository.logStatusChange(
                id,
                updateData.status as unknown as OrderStatusHistory,
                user_id,
                customer_id
            );
        }
    }

    async deleteOrder(id: number): Promise<void> {
        await this.orderRepository.softDelete(id);
    }
}
