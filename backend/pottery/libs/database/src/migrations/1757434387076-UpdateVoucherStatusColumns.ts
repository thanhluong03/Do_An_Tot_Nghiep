import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export enum VoucherCustomerStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    USED = 'USED',
}

export class UpdateVoucherStatusColumns1757434387076 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('voucher_customer');
        if (table) {
            const productIdColumn = table.findColumnByName('product_id');
            const statusColumn = table.findColumnByName('status');
            if (productIdColumn && !statusColumn) {
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
            } else {
                if (!productIdColumn) {
                    console.log('⚠️  Column "product_id" does not exist in "voucher_customer" table — skipping drop.');
                }
                if (statusColumn) {
                    console.log('⚠️  Column "status" already exists in "voucher_customer" table — skipping add.');
                }
            }
        } else {
            console.log('⚠️  Table "voucher_customer" does not exist — skipping update.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('voucher_customer');
        if (table) {
            const statusColumn = table.findColumnByName('status');
            const productIdColumn = table.findColumnByName('product_id');
            if (statusColumn && !productIdColumn) {
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
            } else {
                if (!statusColumn) {
                    console.log('⚠️  Column "status" does not exist in "voucher_customer" table — skipping drop.');
                }
                if (productIdColumn) {
                    console.log('⚠️  Column "product_id" already exists in "voucher_customer" table — skipping add.');
                }
            }
        } else {
            console.log('⚠️  Table "voucher_customer" does not exist — skipping update.');
        }
    }
}
