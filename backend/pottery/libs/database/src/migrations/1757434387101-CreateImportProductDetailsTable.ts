import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateImportProductDetailsTable1757434387101
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tạo bảng import_product_details
    const detailsTableExists = await queryRunner.hasTable(
      'import_product_details',
    );
    if (!detailsTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'import_product_details',
          columns: [
            {
              name: 'id',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            { name: 'product_id', type: 'int', isNullable: false },
            { name: 'import_product_id', type: 'int', isNullable: false },
            {
              name: 'classification_attribute_relationship_id',
              type: 'int',
              isNullable: true,
            },
            { name: 'import_quantity', type: 'int', isNullable: false },
            {
              name: 'import_price',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: false,
            },
            {
              name: 'created_at',
              type: 'timestamptz',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamptz',
              isNullable: true,
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'deleted_at',
              type: 'timestamptz',
              isNullable: true,
            },
          ],
        }),
      );

      // Tạo foreign key cho import_product_id
      await queryRunner.createForeignKey(
        'import_product_details',
        new TableForeignKey({
          columnNames: ['import_product_id'],
          referencedTableName: 'import_products',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );

      // Tạo foreign key cho classification_attribute_relationship_id
      await queryRunner.createForeignKey(
        'import_product_details',
        new TableForeignKey({
          columnNames: ['classification_attribute_relationship_id'],
          referencedTableName: 'classification_attribute_relationships',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      );

      await queryRunner.createForeignKey(
        'import_product_details',
        new TableForeignKey({
          columnNames: ['product_id'],
          referencedTableName: 'products',
          referencedColumnNames: ['id'],
          onDelete: 'SET NULL',
        }),
      );

      console.log('✅ Table "import_product_details" created successfully.');
    } else {
      console.log(
        '⚠️  Table "import_product_details" already exists — skipping creation.',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 2. Xóa bảng import_product_details
    const detailsTableExists = await queryRunner.hasTable(
      'import_product_details',
    );
    if (detailsTableExists) {
      await queryRunner.dropTable('import_product_details');
      console.log('✅ Table "import_product_details" dropped successfully.');
    }
  }
}
