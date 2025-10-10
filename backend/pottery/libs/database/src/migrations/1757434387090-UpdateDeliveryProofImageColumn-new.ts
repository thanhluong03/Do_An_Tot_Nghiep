import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateDeliveryProofImageColumn1757434387090 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('delivery_proofs', 'image_url');
        await queryRunner.addColumn(
            'delivery_proofs',
            new TableColumn({
                name: 'image_proof',
                type: 'bytea',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
    }
}