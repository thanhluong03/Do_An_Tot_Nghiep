import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductImageTable1757434387062 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('product_images');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'product_images',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'product_id', type: 'int', isNullable: false },
                        { name: 'is_main_image', type: 'boolean', isNullable: true },
                        { name: 'priority', type: 'int', isNullable: true },
                        { name: 'image_data', type: 'bytea', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'product_images',
                new TableForeignKey({
                    columnNames: ['product_id'],
                    referencedTableName: 'products',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "product_images" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('product_images');
        if (tableExists) {
            await queryRunner.dropTable('product_images');
        }
    }
}
