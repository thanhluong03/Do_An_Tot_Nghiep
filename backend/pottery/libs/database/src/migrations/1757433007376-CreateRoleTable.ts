import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateRoleTable1757433007376 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('roles');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'roles',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'name', type: 'varchar', length: '50', isNullable: false, isUnique: true },
                        { name: 'description', type: 'text', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            );
        } else {
            console.log('⚠️  Table "roles" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('roles');
        if (tableExists) {
            await queryRunner.dropTable('roles');
        }
    }

}
