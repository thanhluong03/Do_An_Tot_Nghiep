import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddDriverIdDeliveryProofTable1757434387089 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('delivery_proofs');
        if (table) {
            const driverIdColumn = table.findColumnByName('driver_id');
            if (!driverIdColumn) {
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
            } else {
                console.log('⚠️  Column "driver_id" already exists in "delivery_proofs" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "delivery_proofs" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('delivery_proofs');
        if (table) {
            const driverIdColumn = table.findColumnByName('driver_id');
            if (driverIdColumn) {
                await queryRunner.dropColumn('delivery_proofs', 'driver_id');
            } else {
                console.log('⚠️  Column "driver_id" does not exist in "delivery_proofs" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "delivery_proofs" does not exist — skipping drop.');
        }
    }
}
