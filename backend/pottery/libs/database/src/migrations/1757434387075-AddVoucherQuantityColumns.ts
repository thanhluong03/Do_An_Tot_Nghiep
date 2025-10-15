import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddVoucherQuantityColumns1757434387075 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('vouchers');
        if (table) {
            const quantityColumn = table.findColumnByName('quantity');
            if (!quantityColumn) {
                await queryRunner.addColumn(
                    'vouchers',
                    new TableColumn({
                        name: 'quantity',
                        type: 'int',
                        isNullable: false,
                        default: 0,
                    }),
                );
            } else {
                console.log('⚠️  Column "quantity" already exists in "vouchers" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "vouchers" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('vouchers');
        if (table) {
            const quantityColumn = table.findColumnByName('quantity');
            if (quantityColumn) {
                await queryRunner.dropColumn('vouchers', 'quantity');
            } else {
                console.log('⚠️  Column "quantity" does not exist in "vouchers" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "vouchers" does not exist — skipping drop.');
        }
    }
}
