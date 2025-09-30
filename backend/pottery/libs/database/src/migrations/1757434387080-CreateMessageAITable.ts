import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessageAITable1757434387080 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'messageAIs',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'conversationAI_id', type: 'int', isNullable: false },
                    { name: 'sender_id', type: 'int', isNullable: false },
                    { name: 'content', type: 'text', isNullable: true },
                    { name: 'sent_at', type: 'timestamptz' },
                    { name: 'is_read', type: 'boolean', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'messageAIs',
            new TableForeignKey({
                columnNames: ['conversationAI_id'],
                referencedTableName: 'conversationAIs',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )

        await queryRunner.createForeignKey(
            'messageAIs',
            new TableForeignKey({
                columnNames: ['sender_id'],
                referencedTableName: 'customers',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('messageAIs')
    }

}
