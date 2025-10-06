import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddCategoryIdProductTable1757434387082 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'category_id',
                type: 'int',
                isNullable: false,
                default: 1,
            }),
        );
        await queryRunner.createForeignKey(
            'products',
            new TableForeignKey({
                columnNames: ['category_id'],
                referencedTableName: 'categories',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'category_id');
    }
}
