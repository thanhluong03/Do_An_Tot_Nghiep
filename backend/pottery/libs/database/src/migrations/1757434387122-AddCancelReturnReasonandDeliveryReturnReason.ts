import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCancelReturnReasonandDeliveryReturnReason1757434387122 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const cancelReturnReasonColumn = table.findColumnByName('cancel_return_reason');
            const cancelReturnDateColumn = table.findColumnByName('cancel_return_date');
            const personCancelReturnColumn = table.findColumnByName('person_cancel_return');
            const deliveryFailReturnReasonColumn = table.findColumnByName('delivery_fail_return_reason');

            if (!cancelReturnReasonColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'cancel_return_reason',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "cancel_return_reason" already exists in "orders" table — skipping add.');
            }

            if (!cancelReturnDateColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'cancel_return_date',
                        type: 'timestamptz',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "cancel_return_date" already exists in "orders" table — skipping add.');
            }

            if (!personCancelReturnColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'person_cancel_return',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "person_cancel_return" already exists in "orders" table — skipping add.');
            }

            if (!deliveryFailReturnReasonColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'delivery_fail_return_reason',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "delivery_fail_return_reason" already exists in "orders" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const cancelReturnReasonColumn = table.findColumnByName('cancel_return_reason');
            const cancelReturnDateColumn = table.findColumnByName('cancel_return_date');
            const personCancelReturnColumn = table.findColumnByName('person_cancel_return');
            const deliveryFailReturnReasonColumn = table.findColumnByName('delivery_fail_return_reason');
            if (cancelReturnReasonColumn) {
                await queryRunner.dropColumn('orders', 'cancel_return_reason');
            } else {
                console.log('⚠️  Column "cancel_return_reason" does not exist in "orders" table — skipping drop.');
            }

            if (cancelReturnDateColumn) {
                await queryRunner.dropColumn('orders', 'cancel_return_date');
            } else {
                console.log('⚠️  Column "cancel_return_date" does not exist in "orders" table — skipping drop.');
            }

            if (personCancelReturnColumn) {
                await queryRunner.dropColumn('orders', 'person_cancel_return');
            } else {
                console.log('⚠️  Column "person_cancel_return" does not exist in "orders" table — skipping drop.');
            }

            if (deliveryFailReturnReasonColumn) {
                await queryRunner.dropColumn('orders', 'delivery_fail_return_reason');
            } else {
                console.log('⚠️  Column "delivery_fail_return_reason" does not exist in "orders" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping drop.');
        }
    }
}
