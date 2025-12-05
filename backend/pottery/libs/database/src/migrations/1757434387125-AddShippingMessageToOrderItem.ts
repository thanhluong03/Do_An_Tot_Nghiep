import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddShippingMessageToOrderItem1757434387125 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('order_items');
        if (table) {
            const shippingMessageColumn = table.findColumnByName('shipping_message');
            if (!shippingMessageColumn) {
                await queryRunner.addColumn(
                    'order_items',
                    new TableColumn({
                        name: 'shipping_message',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "shipping_message" already exists in "order_items" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "order_items" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('order_items');
        if (table) {
            const shippingMessageColumn = table.findColumnByName('shipping_message');
            if (shippingMessageColumn) {
                await queryRunner.dropColumn('order_items', 'shipping_message');
            } else {
                console.log('⚠️  Column "shipping_message" does not exist in "order_items" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "order_items" does not exist — skipping drop.');
        }
    }
}
