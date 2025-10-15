import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateDriverLocationTable1757434387070 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('driver_locations');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'driver_locations',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'driver_id', type: 'int', isNullable: false },
                        { name: 'order_id', type: 'int', isNullable: false },
                        { name: 'latitude', type: 'decimal', precision: 9, scale: 6, isNullable: true },
                        { name: 'longitude', type: 'decimal', precision: 9, scale: 6, isNullable: true },
                        { name: 'timestamp', type: 'timestamptz' },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'driver_locations',
                new TableForeignKey({
                    columnNames: ['driver_id'],
                    referencedTableName: 'users',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
            await queryRunner.createForeignKey(
                'driver_locations',
                new TableForeignKey({
                    columnNames: ['order_id'],
                    referencedTableName: 'orders',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "driver_locations" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('driver_locations');
        if (tableExists) {
            await queryRunner.dropTable('driver_locations');
        }
    }

}
