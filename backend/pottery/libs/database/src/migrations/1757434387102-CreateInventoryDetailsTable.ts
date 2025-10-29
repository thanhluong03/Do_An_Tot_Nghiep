import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
} from 'typeorm';

export class CreateInventoryDetailsTable1757434387102
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Tạo bảng inventory_details
        const detailsTableExists = await queryRunner.hasTable(
            'inventory_details',
        );
        if (!detailsTableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'inventory_details',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'inventory_id', type: 'int', isNullable: false },
                        {
                            name: 'classification_attribute_relationship_id',
                            type: 'int',
                            isNullable: false,
                        },
                        { name: 'quantity_stock', type: 'int', isNullable: false },
                        { name: 'quantity_sold', type: 'int', isNullable: false },
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

            // Tạo foreign key cho inventory_id
            await queryRunner.createForeignKey(
                'inventory_details',
                new TableForeignKey({
                    columnNames: ['inventory_id'],
                    referencedTableName: 'inventories',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );

            // Tạo foreign key cho classification_attribute_relationship_id
            await queryRunner.createForeignKey(
                'inventory_details',
                new TableForeignKey({
                    columnNames: ['classification_attribute_relationship_id'],
                    referencedTableName: 'classification_attribute_relationships',
                    referencedColumnNames: ['id'],
                    onDelete: 'CASCADE',
                }),
            );

            console.log('✅ Table "inventory_details" created successfully.');
        } else {
            console.log(
                '⚠️  Table "inventory_details" already exists — skipping creation.',
            );
        }

        // 2. Xóa cột quantity_stock và quantity_sold từ bảng inventories
        const inventoriesTable = await queryRunner.hasTable('inventories');
        if (inventoriesTable) {
            const hasQuantityStock = await queryRunner.hasColumn(
                'inventories',
                'quantity_stock',
            );
            const hasQuantitySold = await queryRunner.hasColumn(
                'inventories',
                'quantity_sold',
            );

            if (hasQuantityStock) {
                await queryRunner.dropColumn('inventories', 'quantity_stock');
                console.log(
                    '✅ Column "quantity_stock" dropped from inventories table.',
                );
            }

            if (hasQuantitySold) {
                await queryRunner.dropColumn('inventories', 'quantity_sold');
                console.log(
                    '✅ Column "quantity_sold" dropped from inventories table.',
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Thêm lại cột quantity_stock và quantity_sold vào bảng inventories
        const inventoryTable = await queryRunner.hasTable('inventories');
        if (inventoryTable) {
            const hasQuantityStock = await queryRunner.hasColumn(
                'inventories',
                'quantity_stock',
            );
            const hasQuantitySold = await queryRunner.hasColumn(
                'inventories',
                'quantity_sold',
            );

            if (!hasQuantityStock) {
                await queryRunner.query(`
                    ALTER TABLE inventories 
                    ADD COLUMN quantity_stock int NULL
                `);
            }

            if (!hasQuantitySold) {
                await queryRunner.query(`
                    ALTER TABLE inventories 
                    ADD COLUMN quantity_sold int NULL
                `);
            }
        }

        // 2. Xóa bảng inventory_details
        const detailsTableExists = await queryRunner.hasTable(
            'inventory_details',
        );
        if (detailsTableExists) {
            await queryRunner.dropTable('inventory_details');
            console.log('✅ Table "inventory_details" dropped successfully.');
        }
    }
}

