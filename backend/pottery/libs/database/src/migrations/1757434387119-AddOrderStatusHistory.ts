import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderStatusHistory1757434387119 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new status values to orders_status_history_status_enum

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'SHIPPING_RETURN';
    `);

        await queryRunner.query(`
      ALTER TYPE "public"."order_status_history_status_enum" 
      ADD VALUE IF NOT EXISTS 'PENDING_DELIVERY_RETURN';
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
