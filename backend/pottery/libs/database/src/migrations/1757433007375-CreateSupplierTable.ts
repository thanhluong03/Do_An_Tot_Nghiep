import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class  CreateSupplierTable1757433007375 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
                    new Table({
                        name: 'suppliers',
                        columns: [
                        {
                            name: 'supplier_id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'name', type: 'varchar', length: '255', isNullable: true, isUnique: true },
                        { name: 'address', type: 'varchar', isNullable: true },
                        { name: 'phone', type: 'varchar', length: '255', isNullable: false },
                        { name: 'email', type: 'varchar', isNullable: false },
                        { name: 'created_at', type: 'date' },
                        { name: 'updated_at', type: 'date'},
                        { name: 'deleted_at', type: 'date', isNullable: true },
                        ],
                    }),
                )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('suppliers')
    }

}
