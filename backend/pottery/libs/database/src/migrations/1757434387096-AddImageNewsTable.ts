import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImageNewsTable1757434387096 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('news');
        if (table) {
            const imageColumn = table.findColumnByName('image_data');
            if (!imageColumn) {
                await queryRunner.addColumn(
                    'news',
                    new TableColumn({
                        name: 'image_data',
                        type: 'bytea',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "image_data" already exists in "news" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "news" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('news');
        if (table) {
            const imageColumn = table.findColumnByName('image_data');
            if (imageColumn) {
                await queryRunner.dropColumn('news', 'image_data');
            } else {
                console.log('⚠️  Column "image_data" does not exist in "news" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "news" does not exist — skipping drop.');
        }
    }
}
