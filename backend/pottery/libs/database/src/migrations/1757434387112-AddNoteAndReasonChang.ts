import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNoteAndReasonChang1757434387112 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const noteColumn = table.findColumnByName('note');
            const reasonChangeColumn = table.findColumnByName('reason_change');

            if (!noteColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'note',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "note" already exists in "orders" table — skipping add.');
            }

            if (!reasonChangeColumn) {
                await queryRunner.addColumn(
                    'orders',
                    new TableColumn({
                        name: 'reason_change',
                        type: 'text',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "reason_change" already exists in "orders" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('orders');
        if (table) {
            const noteColumn = table.findColumnByName('note');
            const reasonChangeColumn = table.findColumnByName('reason_change');

            if (noteColumn) {
                await queryRunner.dropColumn('orders', 'note');
            } else {
                console.log('⚠️  Column "note" does not exist in "orders" table — skipping drop.');
            }

            if (reasonChangeColumn) {
                await queryRunner.dropColumn('orders', 'reason_change');
            } else {
                console.log('⚠️  Column "reason_change" does not exist in "orders" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "orders" does not exist — skipping drop.');
        }
    }
}
