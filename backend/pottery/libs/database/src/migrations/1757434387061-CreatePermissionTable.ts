import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePermissionTable1757434387061 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('permissions');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'permissions',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'role_id', type: 'int', isNullable: false },
                        { name: 'name', type: 'varchar', length: '100', isNullable: true, isUnique: true },
                        { name: 'description', type: 'varchar', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            );
            await queryRunner.createForeignKey(
                'permissions',
                new TableForeignKey({
                    columnNames: ['role_id'],
                    referencedTableName: 'roles',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            );
        } else {
            console.log('⚠️  Table "permissions" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('permissions');
        if (tableExists) {
            await queryRunner.dropTable('permissions');
        }
    }

}
