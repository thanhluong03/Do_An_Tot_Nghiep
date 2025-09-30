import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export enum FlashSaleProductStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    USED = 'USED',
}

export class UpdateFlashSaleStatusColumns1757434387076 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('flash_sale_customer', 'product_id');
        await queryRunner.addColumn(
            'flash_sale_customer',
            new TableColumn({
                name: 'status',
                type: 'enum',
                enum: [
                    FlashSaleProductStatus.CREATED,
                    FlashSaleProductStatus.PENDING,
                    FlashSaleProductStatus.USED,
                ],
                enumName: 'flash_sale_customer_status',
                default: `'${FlashSaleProductStatus.CREATED}'`,
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('flash_sale_customer', 'status');
        await queryRunner.query(`DROP TYPE "flash_sale_customer_status"`);
        await queryRunner.addColumn(
            'flash_sale_customer',
            new TableColumn({
                name: 'product_id',
                type: 'integer',
                isNullable: false,
            }),
        );
    }
}
