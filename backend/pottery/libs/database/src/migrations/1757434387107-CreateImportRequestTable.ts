import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export enum importRequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
}

export class CreateImportRequestTable1757434387107 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('import_requests');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'import_requests',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'store_id', type: 'int', isNullable: false },
                        {
                            name: 'import_request_status',
                            type: 'enum',
                            enum: [importRequestStatus.PENDING, importRequestStatus.ACCEPTED],
                            enumName: 'import_request_status_enum',
                            isNullable: true,
                        },
                        { name: 'note', type: 'text', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'import_requests',
                new TableForeignKey({
                    columnNames: ['store_id'],
                    referencedTableName: 'stores',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "import_requests" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('import_requests');
        if (tableExists) {
            await queryRunner.dropTable('import_requests');
            await queryRunner.query(`DROP TYPE "import_request_status_enum"`);
        }
    }
}
