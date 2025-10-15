import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateReviewTable1757434387065 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('reviews');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'reviews',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'customer_id', type: 'int', isNullable: false },
                        { name: 'product_id', type: 'int', isNullable: false },
                        { name: 'rating', type: 'int', isNullable: true },
                        { name: 'comment', type: 'text', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'reviews',
                new TableForeignKey({
                    columnNames: ['customer_id'],
                    referencedTableName: 'customers',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
            await queryRunner.createForeignKey(
                'reviews',
                new TableForeignKey({
                    columnNames: ['product_id'],
                    referencedTableName: 'products',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "reviews" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('reviews');
        if (tableExists) {
            await queryRunner.dropTable('reviews');
        }
    }

}
