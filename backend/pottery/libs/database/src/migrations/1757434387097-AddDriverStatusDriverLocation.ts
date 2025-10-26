import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export enum DriverStatus {
    WAITING_ACCEPT = 'WAITING_ACCEPT',
    ACCEPTED = 'ACCEPTED',
}

export class AddDriverStatusDriverLocation1757434387097 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('driver_locations');
        if (!table) {
            console.log('⚠️  Table "driver_locations" does not exist — skipping add.');
            return;
        }
        const hasColumn = table.findColumnByName('driver_status');

        if (!hasColumn) {
            await queryRunner.addColumn(
                'driver_locations',
                new TableColumn({
                    name: 'driver_status',
                    type: 'enum',
                    enum: Object.values(DriverStatus),
                    enumName: 'driver_status_enum',
                    isNullable: true,
                }),
            );
        } else {
            console.log('⚠️  Column "driver_status" already exists — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('driver_locations');

        if (table) {
            const hasColumn = table.findColumnByName('driver_status');
            if (hasColumn) {
                await queryRunner.dropColumn('driver_locations', 'driver_status');
            }
        } else {
            console.log('⚠️  Table "driver_locations" does not exist — will still drop enum type.');
        }
        await queryRunner.query(`DROP TYPE IF EXISTS "driver_status_enum"`);
    }
}
