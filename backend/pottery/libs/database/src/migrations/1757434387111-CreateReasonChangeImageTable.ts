import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateReasonChangeImageTable1757434387111 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('reason_change_images');
        if (!tableExists) {
            await queryRunner.createTable(
                new Table({
                    name: 'reason_change_images',
                    columns: [
                        {
                            name: 'id',
                            type: 'int',
                            isPrimary: true,
                            isGenerated: true,
                            generationStrategy: 'increment',
                        },
                        { name: 'order_id', type: 'int', isNullable: false },
                        { name: 'reason_change_image', type: 'bytea', isNullable: true },
                        { name: 'created_at', type: 'timestamptz', default: 'CURRENT_TIMESTAMP' },
                        { name: 'updated_at', type: 'timestamptz', isNullable: true, default: 'CURRENT_TIMESTAMP' },
                        { name: 'deleted_at', type: 'timestamptz', isNullable: true },
                    ],
                }),
            )
            await queryRunner.createForeignKey(
                'reason_change_images',
                new TableForeignKey({
                    columnNames: ['order_id'],
                    referencedTableName: 'orders',
                    referencedColumnNames: ['id'],
                    onDelete: 'SET NULL',
                }),
            )
        } else {
            console.log('⚠️  Table "reason_change_images" already exists — skipping creation.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const tableExists = await queryRunner.hasTable('reason_change_images');
        if (tableExists) {
            await queryRunner.dropTable('reason_change_images');
        }
    }
}
