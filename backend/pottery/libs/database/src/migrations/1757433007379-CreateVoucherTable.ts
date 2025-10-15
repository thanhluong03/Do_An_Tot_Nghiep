import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateVoucherTable1757433007379 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('vouchers');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'vouchers',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'name', type: 'varchar', isNullable: false },
                        { name: 'start_time', type: 'timestamptz', isNullable: true },
                        { name: 'end_time', type: 'timestamptz', isNullable: true },
                        { name: 'is_active', type: 'boolean', isNullable: true },
                        { name: 'effective_period_begins', type: 'timestamptz', isNullable: true },
                        { name: 'effective_period_ends', type: 'timestamptz', isNullable: true },
                        { name: 'voucher_percentage', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                        { name: 'order_conditions', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
        } else {
            console.log('⚠️  Table "vouchers" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('vouchers');
        if (tableExists) {
            await queryRunner.dropTable('vouchers');
        }
    }

}
