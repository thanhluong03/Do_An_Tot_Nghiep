import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsCancelandDeliveryFailReturnOrder1757434387121 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('cancel_reason_images');
        if (table) {
            const isCancelReturnColumn = table.findColumnByName('is_cancel_return');

            if (!isCancelReturnColumn) {
                await queryRunner.addColumn(
                    'cancel_reason_images',
                    new TableColumn({
                        name: 'is_cancel_return',
                        type: 'boolean',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "is_cancel_return" already exists in "cancel_reason_images" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "cancel_reason_images" does not exist — skipping add.');
        }

        const tabledelivery = await queryRunner.getTable('delivery_fail_images');
        if (tabledelivery) {
            const isCancelReturnColumn = tabledelivery.findColumnByName('is_delivery_fail_return');

            if (!isCancelReturnColumn) {
                await queryRunner.addColumn(
                    'delivery_fail_images',
                    new TableColumn({
                        name: 'is_delivery_fail_return',
                        type: 'boolean',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "is_delivery_fail_return" already exists in "delivery_fail_images" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "delivery_fail_images" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('cancel_reason_images');
        if (table) {
            const isCancelReturnColumn = table.findColumnByName('is_cancel_return');

            if (isCancelReturnColumn) {
                await queryRunner.dropColumn('cancel_reason_images', 'is_cancel_return');
            } else {
                console.log('⚠️  Column "is_cancel_return" does not exist in "cancel_reason_images" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "cancel_reason_images" does not exist — skipping drop.');
        }

        const tabledelivery = await queryRunner.getTable('delivery_fail_images');
        if (tabledelivery) {
            const isCancelReturnColumn = tabledelivery.findColumnByName('is_delivery_fail_return');

            if (isCancelReturnColumn) {
                await queryRunner.dropColumn('delivery_fail_images', 'is_delivery_fail_return');
            } else {
                console.log('⚠️  Column "is_delivery_fail_return" does not exist in "delivery_fail_images" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "delivery_fail_images" does not exist — skipping drop.');
        }
    }
}
