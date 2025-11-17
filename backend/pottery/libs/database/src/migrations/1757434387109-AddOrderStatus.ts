import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatus1757434387109 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {

        // Thêm RETURN_REQUESTED nếu chưa có
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    WHERE t.typname = 'orders_status_enum'
                        AND e.enumlabel = 'RETURN_REQUESTED'
                ) THEN
                    ALTER TYPE "orders_status_enum" ADD VALUE 'RETURN_REQUESTED';
                END IF;
            END
            $$;
            `);

        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    WHERE t.typname = 'orders_status_enum'
                        AND e.enumlabel = 'EXCHANGED'
                ) THEN
                    ALTER TYPE "orders_status_enum" ADD VALUE 'EXCHANGED';
                END IF;
            END
            $$;
            `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
