import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateImageReviewTable1757434387110 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('review_images');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'review_images',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'review_id', type: 'int', isNullable: false },
                        { name: 'image_review', type: 'bytea', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'review_images',
                new TableForeignKey({
                    columnNames: ['review_id'],
                    referencedTableName: 'reviews',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "review_images" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('review_images');
        if (tableExists) {
            await queryRunner.dropTable('review_images');
        }
    }
}
