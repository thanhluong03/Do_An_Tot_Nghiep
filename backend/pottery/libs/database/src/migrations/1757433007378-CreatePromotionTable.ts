import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePromotionTable1757433007378 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'promotions',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'name', type: 'varchar', isNullable: false, isUnique: true },
                    { name: 'description', type: 'text', isNullable: true },
                    { name: 'discount_type', type: 'varchar', isNullable: true },
                    { name: 'discount_value', type: 'decimal', precision: 10, scale: 2, isNullable: true },
                    { name: 'start_date', type: 'timestamptz', isNullable: true },
                    { name: 'end_date', type: 'timestamptz', isNullable: true },
                    { name: 'is_active', type: 'boolean', isNullable: true },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('promotions');
    }

}
