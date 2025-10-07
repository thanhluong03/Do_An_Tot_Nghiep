import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export enum VoucherCustomerStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    USED = 'USED',
}

export class UpdateVoucherStatusColumns1757434387076 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('voucher_customer', 'product_id');
        await queryRunner.addColumn(
            'voucher_customer',
            new TableColumn({
                name: 'status',
                type: 'enum',
                enum: [
                    VoucherCustomerStatus.CREATED,
                    VoucherCustomerStatus.PENDING,
                    VoucherCustomerStatus.USED,
                ],
                enumName: 'voucher_customer_status',
                default: `'${VoucherCustomerStatus.CREATED}'`,
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('voucher_customer', 'status');
        await queryRunner.query(`DROP TYPE "voucher_customer_status"`);
        await queryRunner.addColumn(
            'voucher_customer',
            new TableColumn({
                name: 'product_id',
                type: 'integer',
                isNullable: false,
            }),
        );
    }
}
