import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddShippFeeOrderItem1757434387124 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('order_items');
        if (table) {
            const shippingFeeColumn = table.findColumnByName('shipping_fee');
            if (!shippingFeeColumn) {
                await queryRunner.addColumn(
                    'order_items',
                    new TableColumn({
                        name: 'shipping_fee',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                        default: 0,
                    }),
                );
            } else {
                console.log('⚠️  Column "shipping_fee" already exists in "order_items" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "order_items" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('order_items');
        if (table) {
            const shippingFeeColumn = table.findColumnByName('shipping_fee');
            if (shippingFeeColumn) {
                await queryRunner.dropColumn('order_items', 'shipping_fee');
            } else {
                console.log('⚠️  Column "shipping_fee" does not exist in "order_items" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "order_items" does not exist — skipping drop.');
        }
    }
}
