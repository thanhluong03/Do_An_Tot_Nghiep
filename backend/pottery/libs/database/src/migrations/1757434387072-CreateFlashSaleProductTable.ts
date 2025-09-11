import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateFlashSaleProductTable1757434387072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'flash_sale_products',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'flash_sale_id', type: 'int', isNullable: false },
                    { name: 'user_id', type: 'int', isNullable: false },
                    { name: 'product_id', type: 'int', isNullable: false },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'flash_sale_products',
            new TableForeignKey({
                columnNames: ['flash_sale_id'],
                referencedTableName: 'flash_sales',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )

        await queryRunner.createForeignKey(
            'flash_sale_products',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )

        await queryRunner.createForeignKey(
            'flash_sale_products',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('flash_sale_products')
    }
}
