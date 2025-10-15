import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductTable1757434387060 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('products');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'products',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'name', type: 'varchar', length: '255', isNullable: false, isUnique: true },
                        { name: 'description', type: 'varchar', isNullable: true },
                        { name: 'price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            );
        } else {
            console.log('⚠️  Table "products" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('products');
        if (tableExists) {
            await queryRunner.dropTable('products');
        }
    }

}
