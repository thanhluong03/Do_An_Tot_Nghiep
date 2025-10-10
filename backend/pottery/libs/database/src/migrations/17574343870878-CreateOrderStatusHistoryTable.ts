import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
export enum OrderStatusHistory {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}
export class CreateOrderStatusHistoryTable1757434387088 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'order_status_history',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'order_id', type: 'int', isNullable: false },
                    { name: 'actor_id', type: 'int', isNullable: false },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            OrderStatusHistory.CREATED,
                            OrderStatusHistory.CONFIRMED,
                            OrderStatusHistory.SHIPPING,
                            OrderStatusHistory.DELIVERED,
                            OrderStatusHistory.CANCELLED,
                            OrderStatusHistory.REJECTED,
                        ],
                        enumName: 'order_status_history_enum',
                        isNullable: false,
                    },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'order_status_history',
            new TableForeignKey({
                columnNames: ['order_id'],
                referencedTableName: 'orders',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
        await queryRunner.createForeignKey(
            'order_status_history',
            new TableForeignKey({
                columnNames: ['actor_id'],
                referencedTableName: 'actor_change_status_order',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('order_status_history')
        await queryRunner.query(`DROP TYPE "order_status_history_enum"`);
    }

}
