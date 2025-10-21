
import { Injectable, NotFoundException } from '@nestjs/common';
import { CustomerRepository } from '../../database/src/repositories/customer.repository';
import { ICreateCustomer, IUpdateCustomer, IListCustomer } from './customer.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
    constructor(private readonly customerRepository: CustomerRepository) { }

    async getCustomers(params: IListCustomer): Promise<{ message: string, customers: any[] }> {
        const customers = await this.customerRepository.findAll({
            page: params.page || 1,
            size: params.size || 10,
            key: params.key,
        });
        const customersWithAvatar = customers.map((customer) => {
            let avatarBase64: string | null = null;
            if (customer.avatar_image) {
                avatarBase64 = Buffer.isBuffer(customer.avatar_image)
                    ? customer.avatar_image.toString('base64')
                    : String(customer.avatar_image);
            }
            return {
                ...customer,
                avatar_image: avatarBase64,
            };
        });
        return {
            message: customers.length > 0 ? 'Customers fetched successfully' : 'No customers found',
            customers: customersWithAvatar,
        };
    }

    async createCustomer(data: ICreateCustomer): Promise<{ message: string, customer: any | null }> {
        if (data.password_hash) {
            const saltRounds = 10;
            data.password_hash = await bcrypt.hash(data.password_hash, saltRounds);
        }
        try {
            const customer = await this.customerRepository.create(data);
            return {
                message: 'Customer created successfully',
                customer,
            };
        } catch (error) {
            return {
                message: 'Failed to create customer',
                customer: null,
            };
        }
    }

    async updateCustomer(id: number, data: IUpdateCustomer) {
        if (data.password_hash) {
            const saltRounds = 10;
            data.password_hash = await bcrypt.hash(data.password_hash, saltRounds);
        }
        const customer = await this.customerRepository.findById(id);
        if (!customer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        await this.customerRepository.update(id, data);
        return this.customerRepository.findById(id);
    }

    async deleteCustomer(id: number) {
        const customer = await this.customerRepository.findById(id);
        if (!customer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        await this.customerRepository.softDelete(id);
        return {
            success: true,
            message: 'Customer deleted successfully'
        };
    }

    async getCustomerById(id: number) {
        const customer = await this.customerRepository.findById(id);
        if (!customer) {
            throw new NotFoundException(`Customer with id ${id} not found`);
        }
        let avatarBase64: string | null = null;
        if (customer.avatar_image) {
            avatarBase64 = Buffer.isBuffer(customer.avatar_image)
                ? customer.avatar_image.toString('base64')
                : String(customer.avatar_image);
        }
        return {
            ...customer,
            avatar_image: avatarBase64,
        };
    }
}
