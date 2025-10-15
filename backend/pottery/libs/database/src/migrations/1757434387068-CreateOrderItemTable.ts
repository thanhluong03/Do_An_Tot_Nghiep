import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrderItemTable1757434387068 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('order_items');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'order_items',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'order_id', type: 'int', isNullable: false },
                        { name: 'product_id', type: 'int', isNullable: false },
                        { name: 'quantity', type: 'int', isNullable: true },
                        { name: 'price_at_order', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'order_items',
                new TableForeignKey({
                    columnNames: ['order_id'],
                    referencedTableName: 'orders',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
            await queryRunner.createForeignKey(
                'order_items',
                new TableForeignKey({
                    columnNames: ['product_id'],
                    referencedTableName: 'products',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "order_items" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('order_items');
        if (tableExists) {
            await queryRunner.dropTable('order_items');
        }
    }

}
