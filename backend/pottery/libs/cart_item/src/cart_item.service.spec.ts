import { Test, TestingModule } from '@nestjs/testing';
import { CartItemService } from './cart_item.service';
import { CartItemRepository, ProductRepository, InventoryRepository, CartItemEntity, ProductEntity, StoreEntity, InventoryEntity } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { ICreateCartItem, IListCartItem, IUpdateCartItem } from './cart_item.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

describe('CartItemService', () => {
    let service: CartItemService;
    let mockCartItemRepository: jest.Mocked<CartItemRepository>;
    let mockProductRepository: jest.Mocked<ProductRepository>;
    let mockInventoryRepository: jest.Mocked<InventoryRepository>;

    const mockCartItem: CartItemEntity = {
        id: 1,
        product_id: 1,
        customer_id: 1,
        store_id: 1,
        quantity: 2,
        classification_attribute_relationship_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as CartItemEntity;

    const mockProduct: ProductEntity = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as ProductEntity;

    const mockStore: StoreEntity = {
        id: 1,
        store_name: 'Test Store',
        address: 'Test Address',
        phone: '1234567890',
        inventories: [],
        cartItems: [],
        orderItems: [],
        users: [],
        importRequests: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as StoreEntity;

    const mockInventory: InventoryEntity = {
        id: 1,
        product_id: 1,
        store_id: 1,
        quantity_stock: 10,
        store: mockStore,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as InventoryEntity;

    beforeEach(async () => {
        const mockCartItemRepo = {
            findById: jest.fn(),
            findAll: jest.fn(),
            findAllByCustomer: jest.fn(),
            findByCustomerProductStoreClassification: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        };

        const mockProductRepo = {
            findById: jest.fn(),
        };

        const mockInventoryRepo = {
            findByProductAndStore: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CartItemService,
                { provide: CartItemRepository, useValue: mockCartItemRepo },
                { provide: ProductRepository, useValue: mockProductRepo },
                { provide: InventoryRepository, useValue: mockInventoryRepo },
            ],
        }).compile();

        service = module.get<CartItemService>(CartItemService);
        mockCartItemRepository = module.get(CartItemRepository);
        mockProductRepository = module.get(ProductRepository);
        mockInventoryRepository = module.get(InventoryRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Kiểm tra service đã được khởi tạo thành công');
    });

    describe('create', () => {
        const createData: ICreateCartItem = {
            product_id: 1,
            customer_id: 1,
            store_id: 1,
            quantity: 2,
            classification_attribute_relationship_id: 1,
        };

        it('should return error when product not found', async () => {
            mockProductRepository.findById.mockResolvedValue(null);

            const result = await service.create(createData);

            expect(result).toEqual({
                message: 'Product not found',
                cartItem: null,
            });
            expect(mockProductRepository.findById).toHaveBeenCalledWith(1);
            console.log('✅ Trả về lỗi khi không tìm thấy sản phẩm');
        });

        it('should update quantity when cart item already exists', async () => {
            const existingCartItem = { ...mockCartItem, quantity: 3 };
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockCartItemRepository.findByCustomerProductStoreClassification.mockResolvedValue(mockCartItem);
            mockCartItemRepository.update.mockResolvedValue(undefined);
            mockCartItemRepository.findById.mockResolvedValue(existingCartItem);

            const result = await service.create(createData);

            expect(result).toEqual({
                message: 'Cart item quantity updated',
                cartItem: existingCartItem,
            });
            expect(mockCartItemRepository.update).toHaveBeenCalledWith(1, { quantity: 4 });
            console.log('✅ Đã cập nhật số lượng khi sản phẩm đã có trong giỏ hàng');
        });

        it('should create new cart item when not exists', async () => {
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockCartItemRepository.findByCustomerProductStoreClassification.mockResolvedValue(null);
            mockCartItemRepository.create.mockResolvedValue(mockCartItem);

            const result = await service.create(createData);

            expect(result).toEqual({
                message: 'Cart item created successfully',
                cartItem: mockCartItem,
            });
            expect(mockCartItemRepository.create).toHaveBeenCalledWith({
                product_id: 1,
                customer_id: 1,
                store_id: 1,
                quantity: 2,
                classification_attribute_relationship_id: 1,
            });
            console.log('✅ Đã tạo mới sản phẩm trong giỏ hàng thành công');
        });

        it('should use default quantity of 1 when not provided', async () => {
            const dataWithoutQuantity = { ...createData, quantity: undefined };
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockCartItemRepository.findByCustomerProductStoreClassification.mockResolvedValue(null);
            mockCartItemRepository.create.mockResolvedValue(mockCartItem);

            await service.create(dataWithoutQuantity);

            expect(mockCartItemRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ quantity: 1 })
            );
            console.log('✅ Sử dụng số lượng mặc định là 1 khi không truyền vào');
        });

        it('should handle errors and return failure message', async () => {
            mockProductRepository.findById.mockRejectedValue(new Error('Database error'));

            const result = await service.create(createData);

            expect(result).toEqual({
                message: 'Failed to create cart item',
                cartItem: null,
            });
            console.log('✅ Xử lý lỗi và trả về thông báo thất bại');
        });
    });

    describe('findAll', () => {
        const listParams: IListCartItem = {
            page: 1,
            size: 10,
        };

        it('should return cart items with product and store data', async () => {
            const cartItems = [mockCartItem];

            mockCartItemRepository.findAll.mockResolvedValue(cartItems);
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockInventoryRepository.findByProductAndStore.mockResolvedValue(mockInventory);

            const result = await service.findAll(listParams);

            expect(result.message).toBe('Cart items fetched successfully');
            expect(result.cartItems).toHaveLength(1);
            expect(result.cartItems[0]).toEqual(
                expect.objectContaining({
                    ...mockCartItem,
                    product: mockProduct,
                    store: mockStore,
                })
            );
            console.log('✅ Lấy danh sách sản phẩm trong giỏ hàng kèm thông tin sản phẩm và cửa hàng thành công');
        });

        it('should use default pagination when not provided', async () => {
            mockCartItemRepository.findAll.mockResolvedValue([]);

            await service.findAll({});

            expect(mockCartItemRepository.findAll).toHaveBeenCalledWith({
                size: DEFAULT_PAGE_SIZE,
                page: DEFAULT_PAGE,
            });
            console.log('✅ Sử dụng phân trang mặc định khi không truyền vào');
        });

        it('should return empty message when no cart items found', async () => {
            mockCartItemRepository.findAll.mockResolvedValue([]);

            const result = await service.findAll(listParams);

            expect(result.message).toBe('No cart items found');
            expect(result.cartItems).toHaveLength(0);
            console.log('✅ Không tìm thấy sản phẩm nào trong giỏ hàng');
        });
    });

    describe('findByCustomer', () => {
        it('should return cart items for specific customer with classification data', async () => {
            const cartItemWithClassification = {
                ...mockCartItem,
                classificationRelationship: {
                    id: 1,
                    price: '100.00',
                    attribute1: { id: 1, name: 'Size' },
                    attribute2: { id: 2, name: 'Color' },
                },
            } as any;

            mockCartItemRepository.findAllByCustomer.mockResolvedValue([cartItemWithClassification]);
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockInventoryRepository.findByProductAndStore.mockResolvedValue(mockInventory);

            const result = await service.findByCustomer(1);

            expect(result.message).toBe('Cart items fetched successfully');
            expect(result.cartItems[0]).toEqual(
                expect.objectContaining({
                    attribute1_id: 1,
                    attribute2_id: 2,
                    attribute1_name: 'Size',
                    attribute2_name: 'Color',
                    classificationPrice: 100,
                    product: mockProduct,
                    store: mockStore,
                })
            );
            console.log('✅ Lấy sản phẩm giỏ hàng theo khách hàng kèm thông tin phân loại thành công');
        });

        it('should handle cart items without classification relationship', async () => {
            mockCartItemRepository.findAllByCustomer.mockResolvedValue([mockCartItem]);
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockInventoryRepository.findByProductAndStore.mockResolvedValue(mockInventory);

            const result = await service.findByCustomer(1);

            expect(result.cartItems[0]).toEqual(
                expect.objectContaining({
                    ...mockCartItem,
                    product: mockProduct,
                    store: mockStore,
                })
            );
            console.log('✅ Xử lý sản phẩm giỏ hàng không có phân loại thành công');
        });
    });

    describe('findOne', () => {
        it('should return cart item with product and store data', async () => {
            mockCartItemRepository.findById.mockResolvedValue(mockCartItem);
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockInventoryRepository.findByProductAndStore.mockResolvedValue(mockInventory);

            const result = await service.findOne(1);

            expect(result.message).toBe('Cart item fetched successfully');
            expect(result.cartItem).toEqual(
                expect.objectContaining({
                    ...mockCartItem,
                    product: mockProduct,
                    store: mockStore,
                })
            );
            console.log('✅ Lấy chi tiết sản phẩm trong giỏ hàng kèm thông tin sản phẩm và cửa hàng thành công');
        });

        it('should throw NotFoundException when cart item not found', async () => {
            mockCartItemRepository.findById.mockResolvedValue(null);

            try {
                await service.findOne(1);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
                console.log('✅ Báo lỗi khi không tìm thấy sản phẩm trong giỏ hàng');
            }
        });
    });

    describe('update', () => {
        const updateData: IUpdateCartItem = {
            product_id: 1,
            customer_id: 1,
            store_id: 1,
            quantity: 3,
        };

        it('should update cart item successfully', async () => {
            const updatedCartItem = { ...mockCartItem, quantity: 3 };

            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockCartItemRepository.update.mockResolvedValue(undefined);
            mockCartItemRepository.findById.mockResolvedValue(updatedCartItem);

            const result = await service.update(1, updateData);

            expect(result.message).toBe('Cart item updated successfully');
            expect(result.cartItem).toEqual(updatedCartItem);
            expect(mockCartItemRepository.update).toHaveBeenCalledWith(1, {
                product_id: 1,
                customer_id: 1,
                store_id: 1,
                quantity: 3,
            });
            console.log('✅ Cập nhật sản phẩm trong giỏ hàng thành công');
        });

        it('should throw NotFoundException when product not found', async () => {
            mockProductRepository.findById.mockResolvedValue(null);

            try {
                await service.update(1, updateData);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
                console.log('✅ Báo lỗi khi không tìm thấy sản phẩm khi cập nhật');
            }
        });

        it('should throw NotFoundException when cart item not found after update', async () => {
            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockCartItemRepository.update.mockResolvedValue(undefined);
            mockCartItemRepository.findById.mockResolvedValue(null);

            try {
                await service.update(1, updateData);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
                console.log('✅ Báo lỗi khi không tìm thấy sản phẩm trong giỏ hàng sau khi cập nhật');
            }
        });

        it('should use default quantity of 1 when not provided', async () => {
            const dataWithoutQuantity = {
                product_id: 1,
                customer_id: 1,
                store_id: 1,
            };

            mockProductRepository.findById.mockResolvedValue(mockProduct);
            mockCartItemRepository.update.mockResolvedValue(undefined);
            mockCartItemRepository.findById.mockResolvedValue(mockCartItem);

            await service.update(1, dataWithoutQuantity);

            expect(mockCartItemRepository.update).toHaveBeenCalledWith(1,
                expect.objectContaining({ quantity: 1 })
            );
            console.log('✅ Sử dụng số lượng mặc định là 1 khi cập nhật mà không truyền vào');
        });
    });

    describe('softDelete', () => {
        it('should delete cart item successfully', async () => {
            mockCartItemRepository.findById.mockResolvedValue(mockCartItem);
            mockCartItemRepository.softDelete.mockResolvedValue(undefined);

            const result = await service.softDelete(1);

            expect(result.message).toBe('Cart item deleted successfully');
            expect(mockCartItemRepository.softDelete).toHaveBeenCalledWith(1);
            console.log('✅ Xóa sản phẩm trong giỏ hàng thành công');
        });

        it('should throw NotFoundException when cart item not found', async () => {
            mockCartItemRepository.findById.mockResolvedValue(null);

            try {
                await service.softDelete(1);
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
                console.log('✅ Báo lỗi khi không tìm thấy sản phẩm trong giỏ hàng khi xóa');
            }
        });
    });
});
