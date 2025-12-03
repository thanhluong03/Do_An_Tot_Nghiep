import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCancelReason1757434387113 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const cancelReasonColumn = table.findColumnByName('cancel_reason');
            const cancelDateColumn = table.findColumnByName('cancel_date');
            const reasonChangeDateColumn = table.findColumnByName('reason_change_date');
            const personCancelColumn = table.findColumnByName('person_cancel');
            const deliveryFailReasonColumn = table.findColumnByName('delivery_fail_reason');

            if (!cancelReasonColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'cancel_reason',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "cancel_reason" already exists in "orders" table — skipping add.');
            }

            if (!cancelDateColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'cancel_date',
                        type: 'timestamptz',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "cancel_date" already exists in "orders" table — skipping add.');
            }
            if (!reasonChangeDateColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'reason_change_date',
                        type: 'timestamptz',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "reason_change_date" already exists in "orders" table — skipping add.');
            }

            if (!personCancelColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'person_cancel',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "person_cancel" already exists in "orders" table — skipping add.');
            }

            if (!deliveryFailReasonColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'delivery_fail_reason',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "delivery_fail_reason" already exists in "orders" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const cancelReasonColumn = table.findColumnByName('cancel_reason');
            const cancelDateColumn = table.findColumnByName('cancel_date');
            const reasonChangeDateColumn = table.findColumnByName('reason_change_date');
            const personCancelColumn = table.findColumnByName('person_cancel');
            const deliveryFailReasonColumn = table.findColumnByName('delivery_fail_reason');

            if (cancelReasonColumn) {
                await queryRunner.dropColumn('orders', 'cancel_reason');
            } else {
                console.log('⚠️  Column "cancel_reason" does not exist in "orders" table — skipping drop.');
            }

            if (cancelDateColumn) {
                await queryRunner.dropColumn('orders', 'cancel_date');
            } else {
                console.log('⚠️  Column "cancel_date" does not exist in "orders" table — skipping drop.');
            }

            if (reasonChangeDateColumn) {
                await queryRunner.dropColumn('orders', 'reason_change_date');
            } else {
                console.log('⚠️  Column "reason_change_date" does not exist in "orders" table — skipping drop.');
            }

            if (personCancelColumn) {
                await queryRunner.dropColumn('orders', 'person_cancel');
            } else {
                console.log('⚠️  Column "person_cancel" does not exist in "orders" table — skipping drop.');
            }

            if (deliveryFailReasonColumn) {
                await queryRunner.dropColumn('orders', 'delivery_fail_reason');
            } else {
                console.log('⚠️  Column "delivery_fail_reason" does not exist in "orders" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping drop.');
        }
    }
}
