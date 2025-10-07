import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateImportProductTable1757434387085 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'import_products',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'product_id', type: 'int', isNullable: false },
                    { name: 'supplier_id', type: 'int', isNullable: false },
                    { name: 'import_quantity', type: 'int', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'import_products',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
        await queryRunner.createForeignKey(
            'import_products',
            new TableForeignKey({
                columnNames: ['supplier_id'],
                referencedTableName: 'suppliers',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('import_products')
    }

}
