import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTotalQuantityDividedProductTable1757434387094 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('products');
        if (table) {
            const totalQuantityDividedColumn = table.findColumnByName('total_quantity_divided');
            if (!totalQuantityDividedColumn) {
                await queryRunner.addColumn(
                    'products',
                    new TableColumn({
                        name: 'total_quantity_divided',
                        type: 'int',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "total_quantity_divided" already exists in "products" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "products" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('products');
        if (table) {
            const totalQuantityDividedColumn = table.findColumnByName('total_quantity_divided');
            if (totalQuantityDividedColumn) {
                await queryRunner.dropColumn('products', 'total_quantity_divided');
            } else {
                console.log('⚠️  Column "total_quantity_divided" does not exist in "products" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "products" does not exist — skipping drop.');
        }
    }
}
