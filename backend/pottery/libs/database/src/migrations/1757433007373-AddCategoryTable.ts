import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCategoryTable1757433007373 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('categories');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'categories',
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
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            );
        } else {
            console.log('⚠️  Table "categories" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('categories');
        if (tableExists) {
            await queryRunner.dropTable('categories');
        }
    }
}
