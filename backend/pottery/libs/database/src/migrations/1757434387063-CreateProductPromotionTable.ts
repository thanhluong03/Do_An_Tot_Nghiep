import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductPromotionTable1757434387063 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'product_promotions',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'product_id', type: 'int', isNullable: false },
                    { name: 'promotion_id', type: 'int', isNullable: false },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'product_promotions',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
        await queryRunner.createForeignKey(
            'product_promotions',
            new TableForeignKey({
                columnNames: ['promotion_id'],
                referencedTableName: 'promotions',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('product_promotions')
    }

}
