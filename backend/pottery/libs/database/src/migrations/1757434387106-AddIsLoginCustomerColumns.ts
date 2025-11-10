import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsLoginCustomerColumns1757434387106 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const isLoginCustomerColumn = table.findColumnByName('is_login_customer');
            if (!isLoginCustomerColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'is_login_customer',
                        type: 'boolean',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "is_login_customer" already exists in "orders" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const isLoginCustomerColumn = table.findColumnByName('is_login_customer');
            if (isLoginCustomerColumn) {
                await queryRunner.dropColumn('orders', 'is_login_customer');
            } else {
                console.log('⚠️  Column "is_login_customer" does not exist in "orders" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping drop.');
        }
    }
}
