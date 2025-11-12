import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateImportRequestDetailTable1757434387108 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('import_request_details');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'import_request_details',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'import_request_id', type: 'int', isNullable: false },
                        { name: 'product_id', type: 'int', isNullable: false },
                        { name: 'classification_attribute_relationship_id', type: 'int', isNullable: true },
                        { name: 'requested_quantity', type: 'int', isNullable: true },
                        { name: 'accept_quantity', type: 'int', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'import_request_details',
                new TableForeignKey({
                    columnNames: ['import_request_id'],
                    referencedTableName: 'stores',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )

            await queryRunner.createForeignKey(
                'import_request_details',
                new TableForeignKey({
                    columnNames: ['product_id'],
                    referencedTableName: 'products',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )

            await queryRunner.createForeignKey(
                'import_request_details',
                new TableForeignKey({
                    columnNames: ['classification_attribute_relationship_id'],
                    referencedTableName: 'classification_attribute_relationships',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "import_request_details" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('import_request_details');
        if (tableExists) {
            await queryRunner.dropTable('import_request_details');
        }
    }
}
