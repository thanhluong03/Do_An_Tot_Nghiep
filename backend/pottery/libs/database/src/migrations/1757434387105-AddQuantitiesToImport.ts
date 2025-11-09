import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddQuantitiesToImport1757434387105 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('import_products');
        if (table) {
            const quantityStockColumn = table.findColumnByName('import_quantity');
            const quantitySoldColumn = table.findColumnByName('import_price');

            if (!quantityStockColumn) {
                await queryRunner.addColumn(
                    'import_products',
                    new TableColumn({
                        name: 'import_quantity',
                        type: 'integer',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "import_quantity" already exists in "import_products" table — skipping add.');
            }

            if (!quantitySoldColumn) {
                await queryRunner.addColumn(
                    'import_products',
                    new TableColumn({
                        name: 'import_price',
                        type: 'decimal',
                        precision: 10,
                        scale: 2,
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "import_price" already exists in "import_products" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "import_products" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('import_products');
        if (table) {
            const quantityStockColumn = table.findColumnByName('import_quantity');
            const quantitySoldColumn = table.findColumnByName('import_price');

            if (quantityStockColumn) {
                await queryRunner.dropColumn('import_products', 'import_quantity');
            } else {
                console.log('⚠️  Column "import_quantity" does not exist in "import_products" table — skipping drop.');
            }

            if (quantitySoldColumn) {
                await queryRunner.dropColumn('import_products', 'import_price');
            } else {
                console.log('⚠️  Column "import_price" does not exist in "import_products" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "import_products" does not exist — skipping drop.');
        }
    }
}
