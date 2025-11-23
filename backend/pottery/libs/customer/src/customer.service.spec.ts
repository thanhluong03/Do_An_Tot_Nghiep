import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { CustomerRepository } from '../../database/src/repositories/customer.repository';
import { CustomerEntity } from '../../database/src/entities/customer.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('CustomerService', () => {
    let service: CustomerService;
    let mockCustomerRepository: jest.Mocked<CustomerRepository>;

    const createMockCustomer = (overrides: Partial<CustomerEntity> = {}): CustomerEntity => ({
        id: 1,
        username: 'testcustomer',
        password_hash: 'hashedPassword',
        email: 'test@test.com',
        full_name: 'Test Customer',
        phone_number: '0123456789',
        address: 'Test Address',
        avatar_image: undefined,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
        reviews: [],
        cartItems: [],
        orders: [],
        voucherCustomers: [],
        conversations: [],
        orderStatusHistories: [],
        ...overrides,
    } as CustomerEntity);

    beforeEach(async () => {
        mockCustomerRepository = {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CustomerService,
                { provide: CustomerRepository, useValue: mockCustomerRepository },
            ],
        }).compile();

        service = module.get<CustomerService>(CustomerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('getCustomers', () => {
        it('should return formatted customers with success message', async () => {
            const mockCustomers = [
                createMockCustomer({
                    username: 'customer1',
                    avatar_image: Buffer.from('test'),
                }),
                createMockCustomer({
                    id: 2,
                    username: 'customer2',
                    avatar_image: undefined,
                }),
            ];
            mockCustomerRepository.findAll.mockResolvedValue(mockCustomers);

            const result = await service.getCustomers({ page: 1, size: 10 });

            expect(mockCustomerRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                size: 10,
                key: undefined,
                start_date: undefined,
                end_date: undefined,
            });
            expect(result.message).toBe('Customers fetched successfully');
            expect(result.customers[0].avatar_image).toBe('dGVzdA==');
            expect(result.customers[1].avatar_image).toBeNull();
            console.log('✅ Get customers thành công');
        });

        it('should return no customers found message when empty', async () => {
            mockCustomerRepository.findAll.mockResolvedValue([]);

            const result = await service.getCustomers({ page: 1, size: 10 });

            expect(result.message).toBe('No customers found');
            expect(result.customers).toEqual([]);
            console.log('✅ No customers found thành công');
        });

        it('should use default pagination when not provided', async () => {
            const mockCustomers = [createMockCustomer()];
            mockCustomerRepository.findAll.mockResolvedValue(mockCustomers);

            await service.getCustomers({});

            expect(mockCustomerRepository.findAll).toHaveBeenCalledWith({
                page: 1,
                size: 10,
                key: undefined,
                start_date: undefined,
                end_date: undefined,
            });
            console.log('✅ Default pagination thành công');
        });

        it('should handle Buffer avatar image correctly', async () => {
            const mockCustomers = [
                createMockCustomer({
                    avatar_image: Buffer.from('testdata'),
                }),
            ];
            mockCustomerRepository.findAll.mockResolvedValue(mockCustomers);

            const result = await service.getCustomers({ page: 1, size: 10 });

            expect(result.customers[0].avatar_image).toBe('dGVzdGRhdGE=');
            console.log('✅ Buffer avatar handling thành công');
        });
    });

    describe('createCustomer', () => {
        it('should create customer successfully with hashed password', async () => {
            const customerData = {
                username: 'newcustomer',
                password_hash: 'plainPassword',
                email: 'new@test.com',
                full_name: 'New Customer',
                address: 'New Address',
            };
            const mockCustomer = createMockCustomer(customerData);
            mockCustomerRepository.create.mockResolvedValue(mockCustomer);

            const result = await service.createCustomer(customerData);

            expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
            expect(result.message).toBe('Customer created successfully');
            expect(result.customer).toEqual(mockCustomer);
            console.log('✅ Create customer with password thành công');
        });

        it('should create customer without password hash', async () => {
            const customerData = {
                username: 'newcustomer',
                email: 'new@test.com',
                full_name: 'New Customer',
                address: 'New Address',
            };
            const mockCustomer = createMockCustomer({ ...customerData, password_hash: undefined });
            mockCustomerRepository.create.mockResolvedValue(mockCustomer);

            // Clear previous calls
            jest.clearAllMocks();

            const result = await service.createCustomer(customerData);

            expect(bcrypt.hash).not.toHaveBeenCalled();
            expect(result.message).toBe('Customer created successfully');
            expect(result.customer).toEqual(mockCustomer);
            console.log('✅ Create customer without password thành công');
        });

        it('should return error message when creation fails', async () => {
            const customerData = { username: 'newcustomer', email: 'new@test.com', address: 'Test Address' };
            mockCustomerRepository.create.mockRejectedValue(new Error('Database error'));

            const result = await service.createCustomer(customerData);

            expect(result.message).toBe('Failed to create customer');
            expect(result.customer).toBeNull();
            console.log('✅ Create customer error handling thành công');
        });
    });

    describe('updateCustomer', () => {
        it('should update customer successfully', async () => {
            const customerId = 1;
            const updateData = { username: 'updatedCustomer', full_name: 'Updated Name' };
            const mockCustomer = createMockCustomer({ username: 'testcustomer' });
            const updatedCustomer = createMockCustomer({ ...updateData });

            mockCustomerRepository.findById.mockResolvedValueOnce(mockCustomer).mockResolvedValueOnce(updatedCustomer);
            mockCustomerRepository.update.mockResolvedValue(undefined);

            const result = await service.updateCustomer(customerId, updateData);

            expect(mockCustomerRepository.update).toHaveBeenCalledWith(customerId, updateData);
            expect(result).toEqual(updatedCustomer);
            console.log('✅ Update customer thành công');
        });

        it('should hash password when updating password', async () => {
            const customerId = 1;
            const updateData = { password_hash: 'newPassword' };
            const mockCustomer = createMockCustomer();

            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
            mockCustomerRepository.update.mockResolvedValue(undefined);

            await service.updateCustomer(customerId, updateData);

            expect(bcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
            console.log('✅ Update customer password thành công');
        });

        it('should throw NotFoundException when customer not found', async () => {
            const customerId = 999;
            const updateData = { username: 'updatedCustomer' };

            mockCustomerRepository.findById.mockResolvedValue(null);

            await expect(service.updateCustomer(customerId, updateData)).rejects.toThrow(
                new NotFoundException(`Customer with id ${customerId} not found`)
            );
            console.log('✅ Update customer not found error thành công');
        });
    });

    describe('deleteCustomer', () => {
        it('should delete customer successfully', async () => {
            const customerId = 1;
            const mockCustomer = createMockCustomer();

            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);
            mockCustomerRepository.softDelete.mockResolvedValue(undefined);

            const result = await service.deleteCustomer(customerId);

            expect(mockCustomerRepository.softDelete).toHaveBeenCalledWith(customerId);
            expect(result.success).toBe(true);
            expect(result.message).toBe('Customer deleted successfully');
            console.log('✅ Delete customer thành công');
        });

        it('should throw NotFoundException when customer not found for deletion', async () => {
            const customerId = 999;

            mockCustomerRepository.findById.mockResolvedValue(null);

            await expect(service.deleteCustomer(customerId)).rejects.toThrow(
                new NotFoundException(`Customer with id ${customerId} not found`)
            );
            console.log('✅ Delete customer not found error thành công');
        });
    });

    describe('getCustomerById', () => {
        it('should return customer with formatted avatar when found', async () => {
            const customerId = 1;
            const mockCustomer = createMockCustomer({
                avatar_image: Buffer.from('testdata'),
            });

            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);

            const result = await service.getCustomerById(customerId);

            expect(mockCustomerRepository.findById).toHaveBeenCalledWith(customerId);
            expect(result.avatar_image).toBe('dGVzdGRhdGE=');
            expect(result.username).toBe(mockCustomer.username);
            console.log('✅ Get customer by ID with avatar thành công');
        });

        it('should return customer with null avatar when no avatar', async () => {
            const customerId = 1;
            const mockCustomer = createMockCustomer({
                avatar_image: undefined,
            });

            mockCustomerRepository.findById.mockResolvedValue(mockCustomer);

            const result = await service.getCustomerById(customerId);

            expect(result.avatar_image).toBeNull();
            console.log('✅ Get customer by ID without avatar thành công');
        });

        it('should throw NotFoundException when customer not found', async () => {
            const customerId = 999;

            mockCustomerRepository.findById.mockResolvedValue(null);

            await expect(service.getCustomerById(customerId)).rejects.toThrow(
                new NotFoundException(`Customer with id ${customerId} not found`)
            );
            console.log('✅ Get customer by ID not found error thành công');
        });
    });
});
