import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddClassificationToCartOrder1757434387103 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 🛒 Update "cart_items" table
        const cartItemsTable = await queryRunner.getTable('cart_items');
        if (cartItemsTable) {
            const classificationColumn = cartItemsTable.findColumnByName('classification_attribute_relationship_id');
            if (!classificationColumn) {
                await queryRunner.addColumn(
                    'cart_items',
                    new TableColumn({
                        name: 'classification_attribute_relationship_id',
                        type: 'int',
                        isNullable: true,
                    }),
                );
            }

            const hasFK = cartItemsTable.foreignKeys.find(
                fk => fk.columnNames.includes('classification_attribute_relationship_id'),
            );
            if (!hasFK) {
                await queryRunner.createForeignKey(
                    'cart_items',
                    new TableForeignKey({
                        columnNames: ['classification_attribute_relationship_id'],
                        referencedTableName: 'classification_attribute_relationships',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    }),
                );
            }
        } else {
            console.log('⚠️  Table "cart_items" does not exist — skipping.');
        }

        // 📦 Update "order_items" table
        const orderItemsTable = await queryRunner.getTable('order_items');
        if (orderItemsTable) {
            const classificationColumn = orderItemsTable.findColumnByName('classification_attribute_relationship_id');
            if (!classificationColumn) {
                await queryRunner.addColumn(
                    'order_items',
                    new TableColumn({
                        name: 'classification_attribute_relationship_id',
                        type: 'int',
                        isNullable: true,
                    }),
                );
            }

            // store_id — ensure exists
            const storeIdColumn = orderItemsTable.findColumnByName('store_id');
            if (!storeIdColumn) {
                await queryRunner.addColumn(
                    'order_items',
                    new TableColumn({
                        name: 'store_id',
                        type: 'int',
                        isNullable: true,
                    }),
                );
            }

            const hasFK = orderItemsTable.foreignKeys.find(
                fk => fk.columnNames.includes('classification_attribute_relationship_id'),
            );
            if (!hasFK) {
                await queryRunner.createForeignKey(
                    'order_items',
                    new TableForeignKey({
                        columnNames: ['classification_attribute_relationship_id'],
                        referencedTableName: 'classification_attribute_relationships',
                        referencedColumnNames: ['id'],
                        onDelete: 'CASCADE',
                    }),
                );
            }
        } else {
            console.log('⚠️  Table "order_items" does not exist — skipping.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 🧹 Remove FK and column from "cart_items"
        const cartItemsTable = await queryRunner.getTable('cart_items');
        if (cartItemsTable) {
            const fk = cartItemsTable.foreignKeys.find(fk =>
                fk.columnNames.includes('classification_attribute_relationship_id'),
            );
            if (fk) {
                await queryRunner.dropForeignKey('cart_items', fk);
            }

            const col = cartItemsTable.findColumnByName('classification_attribute_relationship_id');
            if (col) {
                await queryRunner.dropColumn('cart_items', 'classification_attribute_relationship_id');
            }
        } else {
            console.log('⚠️  Table "cart_items" does not exist — skipping drop.');
        }

        // 🧹 Remove FK and column from "order_items"
        const orderItemsTable = await queryRunner.getTable('order_items');
        if (orderItemsTable) {
            const fk = orderItemsTable.foreignKeys.find(fk =>
                fk.columnNames.includes('classification_attribute_relationship_id'),
            );
            if (fk) {
                await queryRunner.dropForeignKey('order_items', fk);
            }

            const col = orderItemsTable.findColumnByName('classification_attribute_relationship_id');
            if (col) {
                await queryRunner.dropColumn('order_items', 'classification_attribute_relationship_id');
            }
        } else {
            console.log('⚠️  Table "order_items" does not exist — skipping drop.');
        }
    }
}
