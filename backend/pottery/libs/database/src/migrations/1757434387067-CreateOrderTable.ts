import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export enum OrderStatus {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    SHIPPING = 'SHIPPING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
    REJECTED = 'REJECTED',
}

export enum PaymentMethod {
    CARD = 'CARD',
    ONSITE = 'ONSITE',
}

export enum PaymentStatus {
    UNPAID = 'UNPAID',
    PAID = 'PAID',
    REFUNDED = 'REFUNDED',
}

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
                    { name: 'customer_id', type: 'int', isNullable: false },
                    { name: 'driver_id', type: 'int', isNullable: false },
                    { name: 'order_date', type: 'timestamptz' },
                    { name: 'total_amount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                    {
                        name: 'status',
                        type: 'enum',
                        enum: [
                            OrderStatus.CREATED,
                            OrderStatus.CONFIRMED,
                            OrderStatus.SHIPPING,
                            OrderStatus.DELIVERED,
                            OrderStatus.CANCELLED,
                            OrderStatus.REJECTED,
                        ],
                        enumName: 'order_status_enum',
                        default: `'${OrderStatus.CREATED}'`,
                        isNullable: false,
                    },

                    { name: 'shipping_address', type: 'text', isNullable: true },

                    {
                        name: 'payment_method',
                        type: 'enum',
                        enum: [PaymentMethod.CARD, PaymentMethod.ONSITE],
                        enumName: 'payment_method_enum',
                        isNullable: true,
                    },

                    {
                        name: 'payment_status',
                        type: 'enum',
                        enum: [PaymentStatus.UNPAID, PaymentStatus.PAID, PaymentStatus.REFUNDED],
                        enumName: 'payment_status_enum',
                        default: `'${PaymentStatus.UNPAID}'`,
                        isNullable: true,
                    },

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
                columnNames: ['customer_id'],
                referencedTableName: 'customers',
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
        await queryRunner.dropTable('orders');
        await queryRunner.query(`DROP TYPE "order_status_enum"`);
        await queryRunner.query(`DROP TYPE "payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "payment_status_enum"`);
    }
}
