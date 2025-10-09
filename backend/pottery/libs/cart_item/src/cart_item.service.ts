import { CartItemRepository, CartItemEntity, ProductRepository, ProductEntity, InventoryRepository, StoreEntity } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateCartItem, IListCartItem, IUpdateCartItem } from './cart_item.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class CartItemService {
    constructor(
        private readonly cartItemRepository: CartItemRepository,
        private readonly productRepository: ProductRepository,
        private readonly inventoryRepository: InventoryRepository,
    ) { }

    async create(data: ICreateCartItem): Promise<{ message: string, cartItem: CartItemEntity | null }> {
        try {
            const product = await this.productRepository.findById(data.product_id);
            if (!product) {
                return { message: 'Product not found', cartItem: null };
            }
            const quantity = data.quantity ?? 1;
            const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
            const total_amount = price * quantity;
            const cartItem = await this.cartItemRepository.create({
                product_id: data.product_id,
                customer_id: data.customer_id,
                store_id: data.store_id,
                quantity,
                total_amount,
            });
            return {
                message: 'Cart item created successfully',
                cartItem,
            };
        } catch (error) {
            return {
                message: 'Failed to create cart item',
                cartItem: null,
            };
        }
    }

    async findAll(params: IListCartItem): Promise<{ message: string, cartItems: (CartItemEntity & { product?: ProductEntity, store?: StoreEntity })[] }> {
        const cartItems = await this.cartItemRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        const cartItemsWithProductAndStore = await Promise.all(
            cartItems.map(async (cartItem) => {
                const product = await this.productRepository.findById(cartItem.product_id) || undefined;
                let store: StoreEntity | undefined = undefined;
                if (product && cartItem.store_id) {
                    const inventory = await this.inventoryRepository.findByProductAndStore(product.id, cartItem.store_id);
                    if (inventory && inventory.store) {
                        store = inventory.store;
                    }
                }
                return { ...cartItem, product, store };
            })
        );
        return {
            message: cartItemsWithProductAndStore.length > 0 ? 'Cart items fetched successfully' : 'No cart items found',
            cartItems: cartItemsWithProductAndStore,
        };
    }

    async findByCustomer(customer_id: number): Promise<{ message: string, cartItems: (CartItemEntity & { product?: ProductEntity, store?: StoreEntity })[] }> {
        const cartItems = await this.cartItemRepository.findAllByCustomer(customer_id);
        const cartItemsWithProductAndStore = await Promise.all(
            cartItems.map(async (cartItem) => {
                const product = await this.productRepository.findById(cartItem.product_id) || undefined;
                let store: StoreEntity | undefined = undefined;
                if (product && cartItem.store_id) {
                    const inventory = await this.inventoryRepository.findByProductAndStore(product.id, cartItem.store_id);
                    if (inventory && inventory.store) {
                        store = inventory.store;
                    }
                }
                return { ...cartItem, product, store };
            })
        );
        return {
            message: cartItemsWithProductAndStore.length > 0 ? 'Cart items fetched successfully' : 'No cart items found',
            cartItems: cartItemsWithProductAndStore,
        };
    }

    async findOne(id: number): Promise<{ message: string, cartItem: (CartItemEntity & { product?: ProductEntity, store?: StoreEntity }) | null }> {
        const cartItem = await this.cartItemRepository.findById(id);
        if (!cartItem) throw new NotFoundException('Cart item not found');
        const product = await this.productRepository.findById(cartItem.product_id) || undefined;
        let store: StoreEntity | undefined = undefined;
        if (product && cartItem.store_id) {
            const inventory = await this.inventoryRepository.findByProductAndStore(product.id, cartItem.store_id);
            if (inventory && inventory.store) {
                store = inventory.store;
            }
        }
        return {
            message: 'Cart item fetched successfully',
            cartItem: { ...cartItem, product, store },
        };
    }

    async update(id: number, data: IUpdateCartItem): Promise<{ message: string, cartItem: CartItemEntity }> {
        const product = await this.productRepository.findById(data.product_id);
        if (!product) throw new NotFoundException('Product not found');
        const quantity = data.quantity ?? 1;
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        const total_amount = price * quantity;
        await this.cartItemRepository.update(id, {
            ...data,
            quantity,
            total_amount,
        });
        const cartItem = await this.cartItemRepository.findById(id);
        if (!cartItem) throw new NotFoundException('Cart item not found');
        return {
            message: 'Cart item updated successfully',
            cartItem,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const cartItem = await this.cartItemRepository.findById(id);
        if (!cartItem) throw new NotFoundException('Cart item not found');
        await this.cartItemRepository.softDelete(id);
        return { message: 'Cart item deleted successfully' };
    }
}
