import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImportPriceImportProductTable1757434387092 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('import_products');
        if (table) {
            const importPriceColumn = table.findColumnByName('import_price');
            if (!importPriceColumn) {
                await queryRunner.addColumn(
                    'import_products',
                    new TableColumn({
                        name: 'import_price',
                        type: 'decimal', precision: 10, scale: 2,
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
            const importPriceColumn = table.findColumnByName('import_price');
            if (importPriceColumn) {
                await queryRunner.dropColumn('import_products', 'import_price');
            } else {
                console.log('⚠️  Column "import_price" does not exist in "import_products" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "import_products" does not exist — skipping drop.');
        }
    }
}
