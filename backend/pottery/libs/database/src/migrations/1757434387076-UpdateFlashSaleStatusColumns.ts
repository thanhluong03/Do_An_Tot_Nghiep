import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export enum FlashSaleProductStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    USED = 'USED',
}

export class UpdateFlashSaleStatusColumns1757434387076 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('flash_sale_products', 'product_id');
        await queryRunner.addColumn(
            'flash_sale_products',
            new TableColumn({
                name: 'status',
                type: 'enum',
                enum: [
                    FlashSaleProductStatus.CREATED,
                    FlashSaleProductStatus.PENDING,
                    FlashSaleProductStatus.USED,
                ],
                enumName: 'flash_sale_product_status',
                default: `'${FlashSaleProductStatus.CREATED}'`,
                isNullable: false,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('flash_sale_products', 'status');
        await queryRunner.query(`DROP TYPE "flash_sale_product_status"`);
        await queryRunner.addColumn(
            'flash_sale_products',
            new TableColumn({
                name: 'product_id',
                type: 'integer',
                isNullable: false,
            }),
        );
    }
}
