import { VoucherEntity, VoucherRepository, VoucherCustomerEntity, VoucherCustomerRepository } from '@app/database';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICreateVoucher, IListVoucher, IUpdateVoucher } from './voucher.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';
import { DataSource } from 'typeorm';
import { VoucherCustomerStatus } from '@app/database/entities/voucher_customer.entity';

@Injectable()
export class VoucherService {
        constructor(
                private readonly voucherRepository: VoucherRepository,
                private readonly voucherCustomerRepository: VoucherCustomerRepository,
                private readonly dataSource: DataSource,
        ) { }

        async create(data: ICreateVoucher): Promise<{ message: string, voucher: VoucherEntity | null }> {
                try {
                        const voucher = await this.voucherRepository.create({
                                name: data.name,
                                start_time: data.start_time,
                                end_time: data.end_time,
                                effective_period_begins: data.effective_period_begins,
                                effective_period_ends: data.effective_period_ends,
                                is_active: data.is_active,
                                voucher_percentage: data.voucher_percentage,
                                quantity: data.quantity,
                                order_conditions: data.order_conditions,
                        });
                        return {
                                message: 'Voucher created successfully',
                                voucher,
                        };
                } catch (error) {
                        return {
                                message: 'Failed to create voucher',
                                voucher: null,
                        };
                }
        }

        async findAll(params: IListVoucher): Promise<{ message: string; vouchers: VoucherEntity[] }> {
                const vouchers = await this.voucherRepository.findAll({
                        ...params,
                        size: params.size || DEFAULT_PAGE_SIZE,
                        page: params.page || DEFAULT_PAGE,
                });
                return {
                        message:
                                vouchers.length > 0
                                        ? 'Vouchers fetched successfully'
                                        : 'No vouchers found',
                        vouchers,
                };
        }

        async findAllForCustomer(params: IListVoucher): Promise<{ message: string; vouchers: VoucherEntity[] }> {
                const allVouchers = await this.voucherRepository.findAll({
                        ...params,
                        size: params.size || DEFAULT_PAGE_SIZE,
                        page: params.page || DEFAULT_PAGE,
                });
                const now = new Date();
                const vouchers = allVouchers.filter(voucher => {
                        if (!voucher.end_time) return true;
                        return new Date(voucher.end_time) > now;
                });
                return {
                        message:
                                vouchers.length > 0
                                        ? 'Vouchers fetched successfully'
                                        : 'No vouchers found',
                        vouchers,
                };
        }

        async findOne(id: number): Promise<{ message: string, voucher: VoucherEntity }> {
                const voucher = await this.voucherRepository.findById(id);
                if (!voucher) throw new NotFoundException('Voucher not found');
                return {
                        message: 'Voucher fetched successfully',
                        voucher,
                };
        }

        async update(id: number, data: IUpdateVoucher): Promise<{ message: string, voucher: VoucherEntity }> {
                await this.voucherRepository.update(id, data);
                const voucher = await this.voucherRepository.findById(id);
                if (!voucher) throw new NotFoundException('Voucher not found');
                return {
                        message: 'Voucher updated successfully',
                        voucher,
                };
        }

        async softDelete(id: number): Promise<{ message: string }> {
                const voucher = await this.voucherRepository.findById(id);
                if (!voucher) throw new NotFoundException('Voucher not found');
                await this.voucherRepository.softDelete(id);
                return { message: 'Voucher deleted successfully' };
        }

        async updateVoucherCustomer(customerId: number, voucherId: number): Promise<{ message: string; voucherCustomer?: VoucherCustomerEntity }> {
                return await this.dataSource.transaction(async (manager) => {
                        const voucher = await manager.findOne(VoucherEntity, {
                                where: { id: voucherId },
                        });

                        if (!voucher) {
                                throw new NotFoundException('Voucher not found');
                        }

                        if (voucher.quantity <= 0) {
                                throw new BadRequestException('Voucher is out of stock');
                        }

                        const existingVoucherCustomer = await manager.findOne(VoucherCustomerEntity, {
                                where: {
                                        customer_id: customerId,
                                        voucher_id: voucherId,
                                },
                        });

                        if (existingVoucherCustomer) {
                                throw new BadRequestException('Customer already has this voucher');
                        }

                        await manager.update(VoucherEntity, voucherId, {
                                quantity: voucher.quantity - 1,
                        });

                        const voucherCustomer = manager.create(VoucherCustomerEntity, {
                                customer_id: customerId,
                                voucher_id: voucherId,
                                status: VoucherCustomerStatus.CREATED,
                        });

                        const savedVoucherCustomer = await manager.save(voucherCustomer);

                        return {
                                message: 'Received voucher successfully',
                                voucherCustomer: savedVoucherCustomer,
                        };
                });
        }

        async softDeleteExpiredVouchers(): Promise<{ message: string, count: number }> {
                const now = new Date();
                const vouchers = await this.voucherRepository.findAll({ size: 1000, page: 1 });
                let count = 0;
                for (const voucher of vouchers) {
                        if (voucher.effective_period_ends && new Date(voucher.effective_period_ends) < now) {
                                await this.voucherRepository.softDelete(voucher.id);
                                count++;
                        }
                }
                return { message: `Đã xóa mềm ${count} voucher hết hạn!`, count };
        }

        async findAvailableVouchersByCustomer(customerId: number): Promise<VoucherEntity[]> {
                const voucherCustomers = await this.voucherCustomerRepository.findAll({
                        customerId,
                });
                return voucherCustomers
                        .filter(vc => vc.status === VoucherCustomerStatus.CREATED && vc.voucher)
                        .map(vc => vc.voucher);
        }
}