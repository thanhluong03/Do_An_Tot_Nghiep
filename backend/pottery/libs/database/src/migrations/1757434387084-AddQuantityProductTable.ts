import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddQuantityProductTable1757434387084 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'products',
            new TableColumn({
                name: 'quantity',
                type: 'int',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('products', 'quantity');
    }
}
