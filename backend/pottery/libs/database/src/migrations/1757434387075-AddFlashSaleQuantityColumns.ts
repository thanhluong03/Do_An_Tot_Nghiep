import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddQuantityToFlashSales1757434387075 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'flash_sales',
            new TableColumn({
                name: 'quantity',
                type: 'int',
                isNullable: false,
                default: 0,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('flash_sales', 'quantity');
    }
}
