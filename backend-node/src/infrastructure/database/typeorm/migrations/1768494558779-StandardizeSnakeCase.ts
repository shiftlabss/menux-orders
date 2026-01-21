import { MigrationInterface, QueryRunner } from "typeorm";

export class StandardizeSnakeCase1768494558779 implements MigrationInterface {
    name = 'StandardizeSnakeCase1768494558779'

    public async up(queryRunner: QueryRunner): Promise<void> {

        // --- 1. Drop Dependencies First (UpsellRules depend on restaurant_id, so handle them carefully) ---
        // Just in case constraints exist with old names
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT IF EXISTS "FK_40e345386a4e9873a2c86aa40b3"`); // restaurantId

        // --- 2. Rename Columns Back to snake_case ---

        // Upsell Rules
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "triggerProductId" TO "trigger_product_id"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "upgradeProductId" TO "upgrade_product_id"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "upsellType" TO "upsell_type"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "createdAt" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "updatedAt" TO "updated_at"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "restaurantId" TO "restaurant_id"`);

        // Waiters
        await queryRunner.query(`ALTER TABLE "waiters" RENAME COLUMN "restaurantId" TO "restaurant_id"`);

        // Users
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "restaurantId" TO "restaurant_id"`);

        // Order Items
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "orderId" TO "order_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "menuItemId" TO "menu_item_id"`);

        // Customers
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "customerType" TO "customer_type"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "anonId" TO "anon_id"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "restaurantId" TO "restaurant_id"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "createdAt" TO "created_at"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "updatedAt" TO "updated_at"`);

        // Orders
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "restaurantId" TO "restaurant_id"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "waiterId" TO "waiter_id"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "tableId" TO "table_id"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "customerId" TO "customer_id"`);

        // Tables
        await queryRunner.query(`ALTER TABLE "tables" RENAME COLUMN "restaurantId" TO "restaurant_id"`);
        await queryRunner.query(`ALTER TABLE "tables" RENAME COLUMN "waiterId" TO "waiter_id"`);

        // --- 3. Re-Add Constraints (using snake_case) ---
        // Note: FK names (in quotes) are arbitrary but it's good practice to rename them if we want pure cleanup, 
        // but Typescript/TypeORM often generates them hash-based. Here we rely on TypeORM to eventually sync them if we ran a fresh generate,
        // but since we are doing manual SQL, we essentially just renamed columns. The constraints *might* still be pointing to the column via internal ID,
        // but often renaming a column in Postgres updates the constraint automatically.
        // However, if we dropped them, we need to recreate them.

        // Let's verify if we need to manually update constraints. 
        // Postgres USUALLY handles RENAME COLUMN automatically in constraints.
        // So we mainly need to just ensure the `upsell_rules` -> `restaurant_id` link is valid.

        // But for UpsellRules, we previously ADDED `restaurantId` as a NEW column.
        // Now we renamed it to `restaurant_id`.
        // We dropped its constraint `FK_40e...` above. We need to add it back.

        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_upsell_rules_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Revert not implemented
    }
}
