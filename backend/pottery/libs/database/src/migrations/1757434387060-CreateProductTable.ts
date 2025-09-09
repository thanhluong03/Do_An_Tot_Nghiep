import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class  CreateProductTable1757434387060 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'products',
                columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                { name: 'name', type: 'varchar', length: '255', isNullable: true, isUnique: true },
                { name: 'description', type: 'varchar', isNullable: true },
                { name: 'price', type: 'decimal', precision: 10, scale: 2, isNullable: false },
                { name: 'quantity', type: 'int', isNullable: false },
                { name: 'image_url', type: 'varchar', length: '255', isNullable: true },
                { name: 'supplier_id', type: 'int', isNullable: true },
                { name: 'created_at', type: 'date' },
                { name: 'updated_at', type: 'date'},
                { name: 'deleted_at', type: 'date', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'products',
            new TableForeignKey({
                columnNames: ['supplier_id'],
                referencedTableName: 'suppliers',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('products')
    }

}
