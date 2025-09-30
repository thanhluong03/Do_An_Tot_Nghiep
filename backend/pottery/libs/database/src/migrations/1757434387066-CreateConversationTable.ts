import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateConversationTable1757434387066 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'conversations',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'customer_id', type: 'int', isNullable: false },
                    { name: 'user_id', type: 'int', isNullable: false },
                    { name: 'started_at', type: 'timestamptz' },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'conversations',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
        await queryRunner.createForeignKey(
            'conversations',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedTableName: 'customers',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('conversations')
    }

}
