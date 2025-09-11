import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrderTable1757434387067 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'orders',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'user_id', type: 'int', isNullable: false },
                    { name: 'driver_id', type: 'int', isNullable: false },
                    { name: 'order_date', type: 'timestamptz' },
                    { name: 'total_amount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                    { name: 'status', type: 'varchar', isNullable: true, default: "'PENDING'" },
                    { name: 'shipping_address', type: 'text', isNullable: true },
                    { name: 'payment_method', type: 'varchar', isNullable: true },
                    { name: 'payment_status', type: 'varchar', isNullable: true, default: "'UNPAID'" },
                    { name: 'current_order', type: 'json', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'orders',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )

        await queryRunner.createForeignKey(
            'orders',
            new TableForeignKey({
                columnNames: ['driver_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('orders')
    }

}
