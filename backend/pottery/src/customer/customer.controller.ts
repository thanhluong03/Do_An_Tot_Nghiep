import { Controller, Get, Post, Put, Delete, Body, Param, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomerService } from '../../libs/customer/src/customer.service';
import { CreateCustomerDto, UpdateCustomerDto, ListCustomerRequestDto } from './customer.dto';

@Controller('customers')
export class CustomerController {
    constructor(private readonly customerService: CustomerService) { }

    @Post('createcustomer')
    @UseInterceptors(FileInterceptor('avatar_image'))
    async createCustomer(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateCustomerDto
    ) {
        try {
            if (!body || !body.password) {
                throw new Error('Missing password field in request body');
            }
            const { password, ...restData } = body;
            const customerData = {
                ...restData,
                password_hash: password,
                avatar_image: file ? file.buffer : undefined
            };
            const customer = await this.customerService.createCustomer(customerData);
            return customer;
        } catch (error) {
            throw error;
        }
    }

    @Get('listcustomers')
    async getCustomers(@Query() query: ListCustomerRequestDto) {
        return await this.customerService.getCustomers(query);
    }

    @Get('customerdetail/:id')
    async getCustomerDetail(@Param('id') id: number) {
        return await this.customerService.getCustomerById(Number(id));
    }

    @Put('updatecustomer/:id')
    @UseInterceptors(FileInterceptor('avatar_image'))
    async updateCustomer(
        @Param('id') id: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() body: UpdateCustomerDto
    ) {
        try {
            if (!body) {
                throw new Error('Missing request body');
            }
            let customerData: any = { ...body };
            if (body.password) {
                customerData.password_hash = body.password;
                delete customerData.password;
            }
            if (file) {
                customerData.avatar_image = file.buffer;
            }
            const customer = await this.customerService.updateCustomer(Number(id), customerData);
            return customer;
        } catch (error) {
            throw error;
        }
    }

    @Delete('deletecustomer/:id')
    async deleteCustomer(@Param('id') id: number) {
        return await this.customerService.deleteCustomer(Number(id));
    }
}
