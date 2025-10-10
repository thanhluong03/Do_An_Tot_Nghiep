import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddDriverIdDeliveryProofTable1757434387089 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'delivery_proofs',
            new TableColumn({
                name: 'driver_id',
                type: 'int',
                isNullable: false,
            }),
        );

        await queryRunner.createForeignKey(
            'delivery_proofs',
            new TableForeignKey({
                columnNames: ['driver_id'],
                referencedTableName: 'users',
                referencedColumnNames: ['id'],
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('delivery_proofs', 'driver_id');
    }
}
