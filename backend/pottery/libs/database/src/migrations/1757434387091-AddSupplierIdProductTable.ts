import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddSupplierIdProductTable1757434387091 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('products');
        if (table) {
            const supplierIdColumn = table.findColumnByName('supplier_id');
            if (!supplierIdColumn) {
                await queryRunner.addColumn(
                    'products',
                    new TableColumn({
                        name: 'supplier_id',
                        type: 'int',
                        isNullable: false,
                        default: 1,
                    }),
                );
                await queryRunner.createForeignKey(
                    'products',
                    new TableForeignKey({
                        columnNames: ['supplier_id'],
                        referencedColumnNames: ['id'],
                        referencedTableName: 'suppliers',
                        onDelete: 'SET NULL',
                    }),
                );
            } else {
                console.log('⚠️  Column "supplier_id" already exists in "products" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "products" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('products');
        if (table) {
            const supplierIdColumn = table.findColumnByName('supplier_id');
            if (supplierIdColumn) {
                await queryRunner.dropColumn('products', 'supplier_id');
            } else {
                console.log('⚠️  Column "supplier_id" does not exist in "products" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "products" does not exist — skipping drop.');
        }
    }
}
