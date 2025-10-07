import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateVoucherCustomerTable1757434387072 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'voucher_customer',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'voucher_id', type: 'int', isNullable: false },
                    { name: 'customer_id', type: 'int', isNullable: false },
                    { name: 'product_id', type: 'int', isNullable: false },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'voucher_customer',
            new TableForeignKey({
                columnNames: ['voucher_id'],
                referencedTableName: 'vouchers',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )

        await queryRunner.createForeignKey(
            'voucher_customer',
            new TableForeignKey({
                columnNames: ['customer_id'],
                referencedTableName: 'customers',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )

        await queryRunner.createForeignKey(
            'voucher_customer',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedTableName: 'products',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('voucher_customer')
    }
}
