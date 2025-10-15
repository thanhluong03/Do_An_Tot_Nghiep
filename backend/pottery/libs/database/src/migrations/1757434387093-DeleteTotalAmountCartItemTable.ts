import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteTotalAmountCartItemTable1757434387093 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('cart_items');
        if (table) {
            const totalAmountColumn = table.findColumnByName('total_amount');
            if (totalAmountColumn) {
                await queryRunner.dropColumn('cart_items', 'total_amount');
            } else {
                console.log('⚠️  Column "total_amount" does not exist in "cart_items" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "cart_items" does not exist — skipping drop.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
