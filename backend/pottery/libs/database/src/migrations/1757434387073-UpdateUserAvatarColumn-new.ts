import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUserAvatarColumn1757434387073 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'avatar_url');
        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'avatar_image',
                type: 'bytea',
                isNullable: true,
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('users', 'avatar_image');

        await queryRunner.addColumn(
            'users',
            new TableColumn({
                name: 'avatar_url',
                type: 'varchar',
                length: '255',
                isNullable: true,
            }),
        );
    }
}