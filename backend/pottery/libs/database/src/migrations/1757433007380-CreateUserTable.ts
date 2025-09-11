import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateUserTable1757433007380 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'role_id', type: 'int', isNullable: false },
                    { name: 'username', type: 'varchar', length: '100', isNullable: false, isUnique: true },
                    { name: 'password_hash', type: 'varchar', length: '100', isNullable: false },
                    { name: 'email', type: 'varchar', length: '255', isNullable: true },
                    { name: 'full_name', type: 'varchar', length: '100', isNullable: true },
                    { name: 'phone_number', type: 'varchar', length: '12', isNullable: false },
                    { name: 'address', type: 'text', isNullable: false },
                    { name: 'avatar_url', type: 'varchar', length: '255', isNullable: true },
                    { name: 'is_active', type: 'boolean', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'users',
            new TableForeignKey({
                columnNames: ['role_id'],
                referencedTableName: 'roles',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users')
    }

}
