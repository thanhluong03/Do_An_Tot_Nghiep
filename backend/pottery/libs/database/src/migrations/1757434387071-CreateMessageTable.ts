import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateMessageTable1757434387071 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'messages',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'conversation_id', type: 'int', isNullable: false },
                    { name: 'sender_id', type: 'int', isNullable: false },
                    { name: 'sender_type', type: 'enum', isNullable: true, enum: ['USER', 'ADMIN', 'SUPERADMIN'] },
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
            'messages',
            new TableForeignKey({
                columnNames: ['conversation_id'],
                referencedTableName: 'conversations',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )

        await queryRunner.createForeignKey(
            'messages',
            new TableForeignKey({
                columnNames: ['sender_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('messages')
    }

}
