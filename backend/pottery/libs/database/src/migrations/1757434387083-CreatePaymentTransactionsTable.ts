import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePaymentTransactionsTable1757434387083 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('payment_transactions');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'payment_transactions',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'order_id', type: 'int', isNullable: false },
                        { name: 'payment_gateway', type: 'varchar', length: '50', isNullable: false },
                        { name: 'gateway_txn_ref', type: 'varchar', length: '100', isNullable: true },
                        { name: 'amount', type: 'decimal', precision: 15, scale: 2, default: 0 },
                        { name: 'txn_status', type: 'varchar', length: '20', isNullable: true },
                        { name: 'txn_message', type: 'varchar', length: '255', isNullable: true },
                        { name: 'txn_time', type: 'timestamptz', isNullable: true },
                        { name: 'raw_response_data', type: 'json', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'payment_transactions',
                new TableForeignKey({
                    columnNames: ['order_id'],
                    referencedTableName: 'orders',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "payment_transactions" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('payment_transactions');
        if (tableExists) {
            await queryRunner.dropTable('payment_transactions');
        }
    }
}
