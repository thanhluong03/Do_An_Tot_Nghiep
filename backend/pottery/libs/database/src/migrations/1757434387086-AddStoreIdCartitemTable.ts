import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

export class AddStoreIdCartitemTable1757434387086 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'cart_items',
            new TableColumn({
                name: 'store_id',
                type: 'int',
                isNullable: false,
            }),
        );

        await queryRunner.createForeignKey(
            'cart_items',
            new TableForeignKey({
                columnNames: ['store_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'stores',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('cart_items', 'store_id');
    }
}
