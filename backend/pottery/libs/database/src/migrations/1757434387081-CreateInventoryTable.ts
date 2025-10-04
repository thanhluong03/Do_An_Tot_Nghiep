import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateInventoryTable1757434387081 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'inventories',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'product_id', type: 'int', isNullable: false },
                    { name: 'store_id', type: 'int', isNullable: false },
                    { name: 'quantity_stock', type: 'int', isNullable: true },
                    { name: 'quantity_sold', type: 'int', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'inventories',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
        await queryRunner.createForeignKey(
            'inventories',
            new TableForeignKey({
                columnNames: ['store_id'],
                referencedTableName: 'stores',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('inventories')
    }

}
