import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSupplierTable1757433007375 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'suppliers',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'name', type: 'varchar', length: '255', isNullable: false, isUnique: true },
                    { name: 'address', type: 'varchar', isNullable: true },
                    { name: 'phone', type: 'varchar', length: '255', isNullable: true },
                    { name: 'email', type: 'varchar', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP'},
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP'},
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('suppliers')
    }

}
