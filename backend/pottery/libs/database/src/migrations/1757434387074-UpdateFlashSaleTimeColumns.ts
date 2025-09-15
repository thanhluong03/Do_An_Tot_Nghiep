import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateFlashSaleTimeColumns1757434387074 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('flash_sales', 'start_time');
        await queryRunner.dropColumn('flash_sales', 'end_time');
        await queryRunner.addColumn(
            'flash_sales',
            new TableColumn({
                name: 'start_time',
                type: 'time',
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            'flash_sales',
            new TableColumn({
                name: 'end_time',
                type: 'time',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('flash_sales', 'start_time');
        await queryRunner.dropColumn('flash_sales', 'end_time');

        await queryRunner.addColumn(
            'flash_sales',
            new TableColumn({
                name: 'start_time',
                type: 'timestamptz',
                isNullable: true,
            }),
        );
        await queryRunner.addColumn(
            'flash_sales',
            new TableColumn({
                name: 'end_time',
                type: 'timestamptz',
                isNullable: true,
            }),
        );
    }
}