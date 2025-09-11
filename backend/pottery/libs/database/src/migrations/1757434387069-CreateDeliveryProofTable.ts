import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDeliveryProofTable1757434387069 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'delivery_proofs',
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    { name: 'order_id', type: 'int', isNullable: false },
                    { name: 'image_url', type: 'varchar', length: '255', isNullable: true },
                    { name: 'captured_at', type: 'timestamptz' },
                    { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                    { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                    { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                ],
            }),
        )
        await queryRunner.createForeignKey(
            'delivery_proofs',
            new TableForeignKey({
                columnNames: ['order_id'],
                referencedTableName: 'orders',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('delivery_proofs')
    }

}
