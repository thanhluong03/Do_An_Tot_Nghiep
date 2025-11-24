import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import {
    OrderRepository,
    OrderEntity,
    InventoryRepository,
    UserRepository,
    CustomerRepository,
    ProductImageRepository,
    ProductRepository,
    CategoryRepository,
    OrderStatusHistoryRepository,
    InventoryDetailRepository,
    ClassificationAttributeRelationshipRepository,
    OrderStatus,
    PaymentStatus,
    PaymentMethod,
} from '@app/database';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ICreateOrder, IUpdateOrder, IListOrder } from './order.interface';

describe('OrderService', () => {
    let service: OrderService;
    let mockOrderRepository: jest.Mocked<OrderRepository>;
    let mockInventoryRepository: jest.Mocked<InventoryRepository>;
    let mockProductRepository: jest.Mocked<ProductRepository>;
    let mockCustomerRepository: jest.Mocked<CustomerRepository>;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockProductImageRepository: jest.Mocked<ProductImageRepository>;
    let mockCategoryRepository: jest.Mocked<CategoryRepository>;
    let mockOrderStatusHistoryRepository: jest.Mocked<OrderStatusHistoryRepository>;
    let mockInventoryDetailRepository: jest.Mocked<InventoryDetailRepository>;
    let mockClassificationAttributeRelationshipRepository: jest.Mocked<ClassificationAttributeRelationshipRepository>;

    const mockOrder: OrderEntity = {
        id: 1,
        customer_id: 1,
        total_amount: 100000,
        status: OrderStatus.CREATED,
        payment_method: PaymentMethod.ONSITE,
        payment_status: PaymentStatus.UNPAID,
        shipping_address: 'Test Address',
        order_date: new Date(),
        current_order: {
            items: [{
                product_id: 1,
                store_id: 1,
                quantity: 2,
                price_at_order: 50000,
                product_name: 'Test Product',
            }],
        },
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    } as OrderEntity;

    const mockProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 50000,
        quantity: 10,
        category_id: 1,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    };

    const mockInventory = {
        id: 1,
        product_id: 1,
        store_id: 1,
        quantity_stock: 5,
        quantity_sold: 0,
        product: mockProduct,
        store: { id: 1, store_name: 'Test Store', address: 'Store Address' },
        inventory_details: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    };

    const mockCustomer = {
        id: 1,
        username: 'testuser',
        full_name: 'Test User',
        email: 'test@example.com',
        phone_number: '0123456789',
        address: 'Test Address',
        password_hash: 'hashed_password',
        avatar_image: null,
        is_active: true,
        reviews: [],
        cart_items: [],
        orders: [],
        conversations: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    };

    const mockCategory = {
        id: 1,
        name: 'Test Category',
        description: 'Test Category Description',
        products: [],
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    };

    const mockOrderItem = {
        id: 1,
        order_id: 1,
        product_id: 1,
        quantity: 2,
        price_at_order: 50000,
        store_id: 1,
        classification_attribute_relationship_id: null,
        attribute1_name: null,
        attribute2_name: null,
        product_name: 'Test Product',
        description: 'Test Description',
        category_id: 1,
        category_name: 'Test Category',
        store_name: 'Test Store',
        store_address: 'Store Address',
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    };

    beforeEach(async () => {
        const mockRepos = {
            OrderRepository: {
                findById: jest.fn(),
                findAll: jest.fn(),
                create: jest.fn(),
                createOrder: jest.fn(),
                update: jest.fn(),
                softDelete: jest.fn(),
                getOrderItemsByOrderId: jest.fn(),
                findOrdersForAdmin: jest.fn(),
            },
            InventoryRepository: {
                findByProductAndStore: jest.fn(),
                create: jest.fn(),
            },
            ProductRepository: {
                update: jest.fn(),
            },
            CustomerRepository: {
                findById: jest.fn(),
            },
            UserRepository: {
                findById: jest.fn(),
            },
            ProductImageRepository: {
                findByProductId: jest.fn(),
            },
            CategoryRepository: {
                findById: jest.fn(),
            },
            OrderStatusHistoryRepository: {
                getHistoryByOrderId: jest.fn(),
                logStatusChange: jest.fn(),
            },
            InventoryDetailRepository: {
                findByInventoryAndClassification: jest.fn(),
                update: jest.fn(),
            },
            ClassificationAttributeRelationshipRepository: {},
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OrderService,
                { provide: OrderRepository, useValue: mockRepos.OrderRepository },
                { provide: InventoryRepository, useValue: mockRepos.InventoryRepository },
                { provide: ProductRepository, useValue: mockRepos.ProductRepository },
                { provide: CustomerRepository, useValue: mockRepos.CustomerRepository },
                { provide: UserRepository, useValue: mockRepos.UserRepository },
                { provide: ProductImageRepository, useValue: mockRepos.ProductImageRepository },
                { provide: CategoryRepository, useValue: mockRepos.CategoryRepository },
                { provide: OrderStatusHistoryRepository, useValue: mockRepos.OrderStatusHistoryRepository },
                { provide: InventoryDetailRepository, useValue: mockRepos.InventoryDetailRepository },
                { provide: ClassificationAttributeRelationshipRepository, useValue: mockRepos.ClassificationAttributeRelationshipRepository },
            ],
        }).compile();

        service = module.get<OrderService>(OrderService);
        mockOrderRepository = module.get(OrderRepository);
        mockInventoryRepository = module.get(InventoryRepository);
        mockProductRepository = module.get(ProductRepository);
        mockCustomerRepository = module.get(CustomerRepository);
        mockUserRepository = module.get(UserRepository);
        mockProductImageRepository = module.get(ProductImageRepository);
        mockCategoryRepository = module.get(CategoryRepository);
        mockOrderStatusHistoryRepository = module.get(OrderStatusHistoryRepository);
        mockInventoryDetailRepository = module.get(InventoryDetailRepository);
        mockClassificationAttributeRelationshipRepository = module.get(ClassificationAttributeRelationshipRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        console.log('✅ OrderService được khởi tạo thành công');
        expect(service).toBeDefined();
    });

    describe('createOrder - Tạo đơn hàng', () => {
        const createOrderData: ICreateOrder = {
            customer_id: 1,
            shipping_address: 'Test Address',
            payment_method: PaymentMethod.ONSITE,
            items: [{
                product_id: 1,
                store_id: 1,
                quantity: 2,
                price_at_order: 50000,
            }],
        };

        it('should create order successfully for logged in customer', async () => {
            console.log('🔄 Test: Tạo đơn hàng thành công cho khách hàng đã đăng nhập');

            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
            mockInventoryRepository.findByProductAndStore.mockResolvedValue(mockInventory);
            mockCategoryRepository.findById.mockResolvedValue(mockCategory);
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockProductRepository.update.mockResolvedValue(undefined);
            mockOrderRepository.createOrder.mockResolvedValue(mockOrder);
            mockOrderRepository.getOrderItemsByOrderId.mockResolvedValue([mockOrderItem]);
            mockOrderRepository.update.mockResolvedValue(undefined);

            const result = await service.createOrder(createOrderData);

            console.log('✅ Đơn hàng được tạo thành công');
            expect(result).toEqual(mockOrder);
            expect(mockInventoryRepository.findByProductAndStore).toHaveBeenCalledWith(1, 1);
            expect(mockOrderRepository.createOrder).toHaveBeenCalled();
        });

        it('should throw error when product not found in inventory', async () => {
            console.log('🔄 Test: Lỗi khi không tìm thấy sản phẩm trong kho');

            mockInventoryRepository.findByProductAndStore.mockResolvedValue(null);

            await expect(service.createOrder(createOrderData))
                .rejects.toThrow(NotFoundException);

            console.log('✅ Lỗi được ném ra chính xác khi không tìm thấy sản phẩm');
        });

        it('should throw error when product quantity insufficient', async () => {
            console.log('🔄 Test: Lỗi khi số lượng sản phẩm không đủ');

            const insufficientProduct = { ...mockProduct, quantity: 1 };
            const insufficientInventory = { ...mockInventory, product: insufficientProduct };

            mockInventoryRepository.findByProductAndStore.mockResolvedValue(insufficientInventory);

            await expect(service.createOrder(createOrderData))
                .rejects.toThrow(NotFoundException);

            console.log('✅ Lỗi được ném ra chính xác khi số lượng không đủ');
        });
    });

    describe('getOrderById - Lấy đơn hàng theo ID', () => {
        it('should return order with details when found', async () => {
            console.log('🔄 Test: Lấy thông tin đơn hàng thành công');

            mockOrderRepository.findById.mockResolvedValue(mockOrder);
            mockProductImageRepository.findByProductId.mockResolvedValue([]);
            mockOrderStatusHistoryRepository.getHistoryByOrderId.mockResolvedValue([]);

            const result = await service.getOrderById(1);

            console.log('✅ Thông tin đơn hàng được trả về đầy đủ');
            expect(result).toBeDefined();
            expect(result.id).toBe(1);
            expect(mockOrderRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should return null when order not found', async () => {
            console.log('🔄 Test: Trả về null khi không tìm thấy đơn hàng');

            mockOrderRepository.findById.mockResolvedValue(null);

            const result = await service.getOrderById(999);

            console.log('✅ Trả về null chính xác');
            expect(result).toBeNull();
        });
    });

    describe('getOrders - Lấy danh sách đơn hàng', () => {
        it('should return orders list with pagination', async () => {
            console.log('🔄 Test: Lấy danh sách đơn hàng với phân trang');

            const params: IListOrder = { page: 1, size: 10 };
            mockOrderRepository.findAll.mockResolvedValue({ orders: [mockOrder], total: 1 });
            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);

            const result = await service.getOrders(params);

            console.log('✅ Danh sách đơn hàng được trả về thành công');
            expect(result.orders).toBeDefined();
            expect(result.total).toBe(1);
            expect(result.totalByStatus).toBeDefined();
        });
    });

    describe('updateOrder - Cập nhật đơn hàng', () => {
        it('should update order successfully', async () => {
            console.log('🔄 Test: Cập nhật đơn hàng thành công');

            const updateData: IUpdateOrder = {
                status: OrderStatus.CONFIRMED,
                shipping_address: 'New Address',
            };

            mockOrderRepository.findById.mockResolvedValue(mockOrder);
            mockOrderRepository.update.mockResolvedValue(undefined);
            mockOrderStatusHistoryRepository.logStatusChange.mockResolvedValue(undefined);

            await service.updateOrder(1, updateData, 1, undefined, 'user');

            console.log('✅ Đơn hàng được cập nhật thành công');
            expect(mockOrderRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
                status: OrderStatus.CONFIRMED,
                shipping_address: 'New Address',
            }));
        });

        it('should throw error when order not found', async () => {
            console.log('🔄 Test: Lỗi khi không tìm thấy đơn hàng để cập nhật');

            mockOrderRepository.findById.mockResolvedValue(null);

            await expect(service.updateOrder(999, { status: OrderStatus.CONFIRMED }))
                .rejects.toThrow(NotFoundException);

            console.log('✅ Lỗi được ném ra chính xác khi không tìm thấy đơn hàng');
        });
    });

    describe('deleteOrder - Xóa đơn hàng', () => {
        it('should soft delete order successfully', async () => {
            console.log('🔄 Test: Xóa mềm đơn hàng thành công');

            mockOrderRepository.softDelete.mockResolvedValue(undefined);

            await service.deleteOrder(1);

            console.log('✅ Đơn hàng được xóa mềm thành công');
            expect(mockOrderRepository.softDelete).toHaveBeenCalledWith(1);
        });
    });

    describe('getOrdersForAdmin - Lấy đơn hàng cho admin', () => {
        it('should return orders for admin with success message', async () => {
            console.log('🔄 Test: Lấy danh sách đơn hàng cho admin');

            mockOrderRepository.findOrdersForAdmin.mockResolvedValue([mockOrder]);
            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);

            const result = await service.getOrdersForAdmin();

            console.log('✅ Danh sách đơn hàng admin được trả về thành công');
            expect(result.success).toBe(true);
            expect(result.message).toContain('thành công');
            expect(result.data).toBeDefined();
        });

        it('should throw error when getting admin orders fails', async () => {
            console.log('🔄 Test: Lỗi khi lấy đơn hàng admin thất bại');

            mockOrderRepository.findOrdersForAdmin.mockRejectedValue(new Error('Database error'));

            await expect(service.getOrdersForAdmin())
                .rejects.toThrow(BadRequestException);

            console.log('✅ Lỗi được xử lý chính xác khi truy vấn thất bại');
        });
    });

    describe('getOrdersByStore - Lấy đơn hàng theo cửa hàng', () => {
        it('should return orders filtered by store', async () => {
            console.log('🔄 Test: Lấy đơn hàng theo cửa hàng');

            mockOrderRepository.findAll.mockResolvedValue({ orders: [mockOrder], total: 1 });

            const result = await service.getOrdersByStore(1, 1, 10);

            console.log('✅ Danh sách đơn hàng theo cửa hàng được trả về');
            expect(result.orders).toBeDefined();
            expect(result.totalByStatus).toBeDefined();
        });
    });

    describe('exportOrdersToExcel - Xuất Excel', () => {
        it('should export orders to excel successfully', async () => {
            console.log('🔄 Test: Xuất danh sách đơn hàng ra Excel');

            const mockResponse = {
                setHeader: jest.fn(),
                end: jest.fn(),
                write: jest.fn(),
            } as any;

            mockOrderRepository.findAll.mockResolvedValue({ orders: [mockOrder], total: 1 });
            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);

            await service.exportOrdersToExcel(mockResponse);

            console.log('✅ Xuất Excel thành công');
            expect(mockResponse.setHeader).toHaveBeenCalledTimes(2);
            expect(mockResponse.end).toHaveBeenCalled();
        });
    });

    console.log('\n🎯 Tất cả test cases cho OrderService đã được thực hiện!');
    console.log('📋 Bao gồm: Tạo đơn, Lấy đơn, Cập nhật, Xóa, Xuất Excel, Lọc theo cửa hàng');
    console.log('🔍 Các trường hợp lỗi và thành công đều được kiểm tra');
});
