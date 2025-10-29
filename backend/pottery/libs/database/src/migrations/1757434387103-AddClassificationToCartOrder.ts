import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddClassificationToCartOrder1757434387103
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add classification_attribute_relationship_id to cart_items
        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD COLUMN "classification_attribute_relationship_id" integer;
        `);

        // Add classification_attribute_relationship_id to order_items
        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ADD COLUMN "classification_attribute_relationship_id" integer;
        `);

        // Add store_id to order_items if not exists (for consistency)
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'order_items' AND column_name = 'store_id'
                ) THEN
                    ALTER TABLE "order_items" ADD COLUMN "store_id" integer;
                END IF;
            END $$;
        `);

        // Add foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD CONSTRAINT "FK_cart_items_classification_relationship" 
            FOREIGN KEY ("classification_attribute_relationship_id") 
            REFERENCES "classification_attribute_relationships"("id") 
            ON DELETE CASCADE;
        `);

        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ADD CONSTRAINT "FK_order_items_classification_relationship" 
            FOREIGN KEY ("classification_attribute_relationship_id") 
            REFERENCES "classification_attribute_relationships"("id") 
            ON DELETE CASCADE;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove foreign key constraints
        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            DROP CONSTRAINT IF EXISTS "FK_cart_items_classification_relationship";
        `);

        await queryRunner.query(`
            ALTER TABLE "order_items" 
            DROP CONSTRAINT IF EXISTS "FK_order_items_classification_relationship";
        `);

        // Remove columns
        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            DROP COLUMN IF EXISTS "classification_attribute_relationship_id";
        `);

        await queryRunner.query(`
            ALTER TABLE "order_items" 
            DROP COLUMN IF EXISTS "classification_attribute_relationship_id";
        `);
    }
}
