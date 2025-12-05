import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddImportRequestreject1757434387126 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('import_requests');
        if (table) {
            const cancelReasonColumn = table.findColumnByName('reject_reason');

            if (!cancelReasonColumn) {
                await queryRunner.addColumn(
                    'import_requests',
                    new TableColumn({
                        name: 'reject_reason',
                        type: 'varchar',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "reject_reason" already exists in "import_requests" table — skipping add.');
            }
        } else {
            console.log('⚠️  Table "import_requests" does not exist — skipping add.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('import_requests');
        if (table) {
            const rejectReasonColumn = table.findColumnByName('reject_reason');

            if (rejectReasonColumn) {
                await queryRunner.dropColumn('import_requests', 'reject_reason');
            } else {
                console.log('⚠️  Column "reject_reason" does not exist in "import_requests" table — skipping drop.');
            }
        } else {
            console.log('⚠️  Table "import_requests" does not exist — skipping drop.');
        }
    }
}
