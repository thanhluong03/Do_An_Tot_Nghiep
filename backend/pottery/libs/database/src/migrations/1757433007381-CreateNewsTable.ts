import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateNewsTable1757433007381 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'news',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'user_id', type: 'int', isNullable: false },
                    { name: 'title', type: 'varchar', isNullable: false, isUnique: true },
                    { name: 'content', type: 'text', isNullable: true },
                    { name: 'published_at', type: 'timestamptz', isNullable: true },
                    { name: 'is_published', type: 'boolean', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )

        await queryRunner.createForeignKey(
            'news',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('news')
    }

}
