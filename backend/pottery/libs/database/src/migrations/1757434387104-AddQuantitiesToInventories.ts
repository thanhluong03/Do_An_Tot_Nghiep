import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddQuantitiesToInventories1757434387104 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('inventories');
        if (table) {
            const quantityStockColumn = table.findColumnByName('quantity_stock');
            const quantitySoldColumn = table.findColumnByName('quantity_sold');

            if (!quantityStockColumn) {
                await queryRunner.addColumn(
                    'inventories',
                    new TableColumn({
                        name: 'quantity_stock',
                        type: 'integer',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "quantity_stock" already exists in "inventories" table — skipping add.');
            }

            if (!quantitySoldColumn) {
                await queryRunner.addColumn(
                    'inventories',
                    new TableColumn({
                        name: 'quantity_sold',
                        type: 'integer',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "quantity_sold" already exists in "inventories" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "inventories" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('inventories');
        if (table) {
            const quantityStockColumn = table.findColumnByName('quantity_stock');
            const quantitySoldColumn = table.findColumnByName('quantity_sold');

            if (quantityStockColumn) {
                await queryRunner.dropColumn('inventories', 'quantity_stock');
            } else {
                console.log('⚠️  Column "quantity_stock" does not exist in "inventories" table — skipping drop.');
            }

            if (quantitySoldColumn) {
                await queryRunner.dropColumn('inventories', 'quantity_sold');
            } else {
                console.log('⚠️  Column "quantity_sold" does not exist in "inventories" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "inventories" does not exist — skipping drop.');
        }
    }
}
