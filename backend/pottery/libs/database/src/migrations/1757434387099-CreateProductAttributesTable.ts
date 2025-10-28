import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductAttributesTable1757434387099 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('product_attributes');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'product_attributes',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'product_classification_id', type: 'int', isNullable: false },
                        { name: 'name', type: 'varchar', length: '100', isNullable: false },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'product_attributes',
                new TableForeignKey({
                    columnNames: ['product_classification_id'],
                    referencedTableName: 'product_classifications',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )

        } else {
            console.log('⚠️  Table "product_attributes" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('product_attributes');
        if (tableExists) {
            await queryRunner.dropTable('product_attributes');
        }
    }
}
