import { CartItemRepository, CartItemEntity, ProductRepository, ProductEntity } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateCartItem, IListCartItem, IUpdateCartItem } from './cart_item.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class CartItemService {
    constructor(
        private readonly cartItemRepository: CartItemRepository,
        private readonly productRepository: ProductRepository,
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

    async findAll(params: IListCartItem): Promise<{ message: string, cartItems: (CartItemEntity & { product?: ProductEntity })[] }> {
        const cartItems = await this.cartItemRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        const cartItemsWithProduct = await Promise.all(
            cartItems.map(async (cartItem) => {
                const product = await this.productRepository.findById(cartItem.product_id) || undefined;
                return { ...cartItem, product };
            })
        );
        return {
            message: cartItemsWithProduct.length > 0 ? 'Cart items fetched successfully' : 'No cart items found',
            cartItems: cartItemsWithProduct,
        };
    }

    async findByCustomer(customer_id: number): Promise<{ message: string, cartItems: (CartItemEntity & { product?: ProductEntity })[] }> {
        const cartItems = await this.cartItemRepository.findAllByCustomer(customer_id);
        const cartItemsWithProduct = await Promise.all(
            cartItems.map(async (cartItem) => {
                const product = await this.productRepository.findById(cartItem.product_id) || undefined;
                return { ...cartItem, product };
            })
        );
        return {
            message: cartItemsWithProduct.length > 0 ? 'Cart items fetched successfully' : 'No cart items found',
            cartItems: cartItemsWithProduct,
        };
    }

    async findOne(id: number): Promise<{ message: string, cartItem: (CartItemEntity & { product?: ProductEntity }) | null }> {
        const cartItem = await this.cartItemRepository.findById(id);
        if (!cartItem) throw new NotFoundException('Cart item not found');
        const product = await this.productRepository.findById(cartItem.product_id) || undefined;
        return {
            message: 'Cart item fetched successfully',
            cartItem: { ...cartItem, product },
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
