import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateUserAvatarColumn1757434387073 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('users');
        if (table) {
            const avatarUrlColumn = table.findColumnByName('avatar_url');
            if (avatarUrlColumn) {
                await queryRunner.dropColumn('users', 'avatar_url');
                await queryRunner.addColumn(
                    'users',
                    new TableColumn({
                        name: 'avatar_image',
                        type: 'bytea',
                        isNullable: true,
                    }),
                );
            } else {
                console.log('⚠️  Column "avatar_url" does not exist in "users" table — skipping update.');
            }
        } else {
            console.log('⚠️  Table "users" does not exist — skipping update.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('users');
        if (table) {
            const avatarImageColumn = table.findColumnByName('avatar_image');
            if (avatarImageColumn) {
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
            } else {
                console.log('⚠️  Column "avatar_image" does not exist in "users" table — skipping update.');
            }
        } else {
            console.log('⚠️  Table "users" does not exist — skipping update.');
        }
    }
}