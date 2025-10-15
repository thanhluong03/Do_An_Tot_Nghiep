import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class ChangeFieldInReviewTable1757434387087 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('reviews');
        if (table) {
            const productIdColumn = table.findColumnByName('product_id');
            const orderItemIdColumn = table.findColumnByName('orderitem_id');
            if (productIdColumn && !orderItemIdColumn) {
                await queryRunner.dropColumn('reviews', 'product_id');
                await queryRunner.addColumn(
                    'reviews',
                    new TableColumn({
                        name: 'orderitem_id',
                        type: 'int',
                        isNullable: false,
                    }),
                );
                await queryRunner.createForeignKey(
                    'reviews',
                    new TableForeignKey({
                        columnNames: ['orderitem_id'],
                        referencedTableName: 'order_items',
                        referencedColumnNames: ['id'],
                        onDelete: 'SET NULL',
                    }),
                );
            } else {
                if (!productIdColumn) {
                    console.log('⚠️  Column "product_id" does not exist in "reviews" table — skipping drop.');
                }
                if (orderItemIdColumn) {
                    console.log('⚠️  Column "orderitem_id" already exists in "reviews" table — skipping add.');
                }
            }
        } else {
            console.log('⚠️  Table "reviews" does not exist — skipping update.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('reviews');
        if (table) {
            const orderItemIdColumn = table.findColumnByName('orderitem_id');
            const productIdColumn = table.findColumnByName('product_id');
            if (orderItemIdColumn && !productIdColumn) {
                await queryRunner.dropColumn('reviews', 'orderitem_id');
                await queryRunner.addColumn(
                    'reviews',
                    new TableColumn({
                        name: 'product_id',
                        type: 'int',
                        isNullable: false,
                    }),
                );
            } else {
                if (!orderItemIdColumn) {
                    console.log('⚠️  Column "orderitem_id" does not exist in "reviews" table — skipping drop.');
                }
                if (productIdColumn) {
                    console.log('⚠️  Column "product_id" already exists in "reviews" table — skipping add.');
                }
            }
        } else {
            console.log('⚠️  Table "reviews" does not exist — skipping update.');
        }
    }
}
