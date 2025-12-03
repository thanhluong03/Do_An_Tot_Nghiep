import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewOrderHistoryStatuses1757434387116 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new status values to orders_status_history_status_enum

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'RETURN_REQUESTED';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'EXCHANGED';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'PENDING_RETURN';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'CONFIRMED_RETURN';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'PENDING_DELIVERY';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'DELIVERY_FAILED';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'PACKING';
    `);
    }

    public down(): Promise<void> {
        console.log(
            'Rollback for enum value removal is not automatically supported',
        );
        console.log('Manual intervention required if rollback is needed');

        return Promise.resolve();
    }
}
