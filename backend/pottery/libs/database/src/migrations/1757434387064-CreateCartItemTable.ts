import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateCartItemTable1757434387064 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('cart_items');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'cart_items',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'customer_id', type: 'int', isNullable: false },
                        { name: 'product_id', type: 'int', isNullable: false },
                        { name: 'quantity', type: 'int', isNullable: true },
                        { name: 'total_amount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'cart_items',
                new TableForeignKey({
                    columnNames: ['customer_id'],
                    referencedTableName: 'customers',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "cart_items" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('cart_items');
        if (tableExists) {
            await queryRunner.dropTable('cart_items');
        }
    }

}
