import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusHistory21757434387123 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new status values to orders_status_history_status_enum

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'PACKING_RETURN';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'CANCELLED_RETURN';
    `);
        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'DELIVERY_FAILED_RETURN';
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
