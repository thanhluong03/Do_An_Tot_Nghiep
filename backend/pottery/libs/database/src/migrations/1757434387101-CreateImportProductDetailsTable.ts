import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateImportProductDetailsTable1757434387101
  implements MigrationInterface
{
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
            { name: 'import_product_id', type: 'int', isNullable: false },
            {
              name: 'classification_attribute_relationship_id',
              type: 'int',
              isNullable: false,
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

      console.log('✅ Table "import_product_details" created successfully.');
    } else {
      console.log(
        '⚠️  Table "import_product_details" already exists — skipping creation.',
      );
    }

    // 2. Xóa cột import_quantity và import_price từ bảng import_products
    const importProductsTable = await queryRunner.hasTable('import_products');
    if (importProductsTable) {
      const hasImportQuantity = await queryRunner.hasColumn(
        'import_products',
        'import_quantity',
      );
      const hasImportPrice = await queryRunner.hasColumn(
        'import_products',
        'import_price',
      );

      if (hasImportQuantity) {
        await queryRunner.dropColumn('import_products', 'import_quantity');
        console.log(
          '✅ Column "import_quantity" dropped from import_products table.',
        );
      }

      if (hasImportPrice) {
        await queryRunner.dropColumn('import_products', 'import_price');
        console.log(
          '✅ Column "import_price" dropped from import_products table.',
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm lại cột import_quantity và import_price vào bảng import_products
    const importProductsTable = await queryRunner.hasTable('import_products');
    if (importProductsTable) {
      const hasImportQuantity = await queryRunner.hasColumn(
        'import_products',
        'import_quantity',
      );
      const hasImportPrice = await queryRunner.hasColumn(
        'import_products',
        'import_price',
      );

      if (!hasImportQuantity) {
        await queryRunner.query(`
                    ALTER TABLE import_products 
                    ADD COLUMN import_quantity int NULL
                `);
      }

      if (!hasImportPrice) {
        await queryRunner.query(`
                    ALTER TABLE import_products 
                    ADD COLUMN import_price decimal(10,2) NULL
                `);
      }
    }

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
