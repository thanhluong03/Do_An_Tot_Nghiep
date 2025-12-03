import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentMethodStatus1757434387117 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new status values to orders_status_enum
    await queryRunner.query(`
      ALTER TYPE "public"."orders_payment_status_enum" 
      ADD VALUE IF NOT EXISTS 'PENDING_REFUND';
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
