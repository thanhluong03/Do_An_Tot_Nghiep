import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateClassificationAttributeRelationshipTable1757434387100 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('classification_attribute_relationships');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'classification_attribute_relationships',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'product_attribute_id_1', type: 'int', isNullable: false },
                        { name: 'product_attribute_id_2', type: 'int', isNullable: false },
                        { name: 'price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                        { name: 'quantity', type: 'integer', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'classification_attribute_relationships',
                new TableForeignKey({
                    columnNames: ['product_attribute_id_1'],
                    referencedTableName: 'product_attributes',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
            await queryRunner.createForeignKey(
                'classification_attribute_relationships',
                new TableForeignKey({
                    columnNames: ['product_attribute_id_2'],
                    referencedTableName: 'product_attributes',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )

        } else {
            console.log('⚠️  Table "classification_attribute_relationships" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('classification_attribute_relationships');
        if (tableExists) {
            await queryRunner.dropTable('classification_attribute_relationships');
        }
    }
}
