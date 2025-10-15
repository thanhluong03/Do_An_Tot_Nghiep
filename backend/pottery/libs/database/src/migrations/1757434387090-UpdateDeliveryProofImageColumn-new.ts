import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateDeliveryProofImageColumn1757434387090 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('delivery_proofs');
        if (table) {
            const imageUrlColumn = table.findColumnByName('image_url');
            const imageProofColumn = table.findColumnByName('image_proof');
            if (imageUrlColumn && !imageProofColumn) {
                await queryRunner.dropColumn('delivery_proofs', 'image_url');
                await queryRunner.addColumn(
                    'delivery_proofs',
                    new TableColumn({
                        name: 'image_proof',
                        type: 'bytea',
                        isNullable: true,
                    }),
                );
            } else {
                if (!imageUrlColumn) {
                    console.log('⚠️  Column "image_url" does not exist in "delivery_proofs" table — skipping drop.');
                }
                if (imageProofColumn) {
                    console.log('⚠️  Column "image_proof" already exists in "delivery_proofs" table — skipping add.');
                }
            }
        } else {
            console.log('⚠️  Table "delivery_proofs" does not exist — skipping update.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('delivery_proofs');
        if (table) {
            const imageProofColumn = table.findColumnByName('image_proof');
            const imageUrlColumn = table.findColumnByName('image_url');
            if (imageProofColumn && !imageUrlColumn) {
                await queryRunner.dropColumn('delivery_proofs', 'image_proof');
                await queryRunner.addColumn(
                    'delivery_proofs',
                    new TableColumn({
                        name: 'image_url',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    }),
                );
            } else {
                if (!imageProofColumn) {
                    console.log('⚠️  Column "image_proof" does not exist in "delivery_proofs" table — skipping drop.');
                }
                if (imageUrlColumn) {
                    console.log('⚠️  Column "image_url" already exists in "delivery_proofs" table — skipping add.');
                }
            }
        } else {
            console.log('⚠️  Table "delivery_proofs" does not exist — skipping update.');
        }
    }
}