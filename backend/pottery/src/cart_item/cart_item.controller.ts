
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CartItemService } from '@app/cart_item';
import {
    CreateCartItemDto,
    UpdateCartItemDto,
    ListCartItemRequestDto,
    CartItemResponseDto,
} from './cart_item.dto';
import { plainToInstance } from 'class-transformer';

@Controller('cartitems')
export class CartItemController {
    constructor(private readonly cartItemService: CartItemService) { }

    @Post('createcartitem')
    async createMany(@Body() createCartItemDtos: CreateCartItemDto[]): Promise<any[]> {
        const results = await Promise.all(
            createCartItemDtos.map((dto) => this.cartItemService.create(dto)),
        );
        return results.map((result) => ({
            message: result.message,
            cartItem: result.cartItem
                ? plainToInstance(CartItemResponseDto, result.cartItem, { excludeExtraneousValues: true })
                : null,
        }));
    }

    @Get('listcartitems')
    async findAll(@Query() query: ListCartItemRequestDto): Promise<any> {
        const result = await this.cartItemService.findAll(query);
        if (!result.cartItems || result.cartItems.length === 0) {
            return {
                message: 'No cart item found',
                cartItems: [],
            };
        }
        return {
            message: result.message,
            cartItems: result.cartItems.map((cartItem) => ({
                ...plainToInstance(CartItemResponseDto, cartItem, { excludeExtraneousValues: true }),
                product: cartItem.product,
            })),
        };
    }

    @Get('cartitemcustomer/:customerid')
    async findByCustomer(@Param('customerid') customerid: number): Promise<any> {
        const result = await this.cartItemService.findByCustomer(Number(customerid));
        if (!result.cartItems || result.cartItems.length === 0) {
            return {
                message: 'No cart item found',
                cartItems: [],
            };
        }
        return {
            message: result.message,
            cartItems: result.cartItems.map((cartItem) => ({
                ...plainToInstance(CartItemResponseDto, cartItem, { excludeExtraneousValues: true }),
                product: cartItem.product,
            })),
        };
    }

    @Get('cartitemdetail/:id')
    async findOne(@Param('id') id: number): Promise<any> {
        try {
            const result = await this.cartItemService.findOne(Number(id));
            return {
                message: result.message,
                cartItem: result.cartItem
                    ? {
                        ...plainToInstance(CartItemResponseDto, result.cartItem, { excludeExtraneousValues: true }),
                        product: result.cartItem.product,
                    }
                    : null,
            };
        } catch (error) {
            return {
                message: 'Cart item not found',
                cartItem: null,
            };
        }
    }

    @Put('updatecartitem/:id')
    async updateOne(
        @Param('id') id: number,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ): Promise<any> {
        const result = await this.cartItemService.update(Number(id), updateCartItemDto);
        return {
            message: result.message,
            cartItem: result.cartItem
                ? plainToInstance(CartItemResponseDto, result.cartItem, { excludeExtraneousValues: true })
                : null,
        };
    }

    @Delete('deletecartitem/:id')
    async removeOne(@Param('id') id: number): Promise<{ message: string }[]> {
        const result = await this.cartItemService.softDelete(Number(id));
        return [result];
    }
}