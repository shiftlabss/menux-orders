import { MigrationInterface, QueryRunner } from "typeorm";

export class StandardizeCamelCase1768494558778 implements MigrationInterface {
    name = 'StandardizeCamelCase1768494558778'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop old constraints constraints first
        await queryRunner.query(`ALTER TABLE "menu_items" DROP CONSTRAINT IF EXISTS "FK_a6b42bf45dbdef19cbf05a4cacf"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT IF EXISTS "FK_3d4ec36469ff3f97b558c55fba3"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT IF EXISTS "FK_831387c5b7fdade8d09ba8821a7"`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP CONSTRAINT IF EXISTS "FK_775bbd2a9d923cda519732eb788"`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP CONSTRAINT IF EXISTS "FK_waiters_restaurant_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_a2db2210c81ee6fb1c11843e18c"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT IF EXISTS "FK_e462517174f561ece2916701c0a"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT IF EXISTS "FK_76038a7f0cc133ac7d2c387a7cf"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_85fdda5fcce2f397ef8f117a2c6"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_1aeeb86b9610f47f8a28e2be1db"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_3d36410e89a795172fa6e0dd968"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT IF EXISTS "FK_77e362d578933cf4518770d11ae"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT IF EXISTS "FK_b520ec91c6e8486f51551d54129"`);

        // Drop legacy varchar columns if they exist (to allow renaming uuid columns)
        await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN IF EXISTS "waiterId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "waiterId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "tableId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "customerId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "customerName"`); // Removed in entity
        await queryRunner.query(`ALTER TABLE "waiters" DROP COLUMN IF EXISTS "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "restaurantId"`);
        // Customers usually have restaurant_id uuid, check if they have restaurantId varchar? Unlikely but safe to check.
        // await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN IF EXISTS "restaurantId"`); 

        // Rename Columns
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "trigger_product_id" TO "triggerProductId"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "upgrade_product_id" TO "upgradeProductId"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "upsell_type" TO "upsellType"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "created_at" TO "createdAt"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" RENAME COLUMN "updated_at" TO "updatedAt"`);

        await queryRunner.query(`ALTER TABLE "waiters" RENAME COLUMN "restaurant_id" TO "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "waiters" ALTER COLUMN "restaurantId" TYPE uuid USING "restaurantId"::uuid`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "restaurant_id" TO "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "restaurantId" TYPE uuid USING "restaurantId"::uuid`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "order_id" TO "orderId"`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "orderId" TYPE uuid USING "orderId"::uuid`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "menu_item_id" TO "menuItemId"`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "menuItemId" TYPE uuid USING "menuItemId"::uuid`);

        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "customer_type" TO "customerType"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "anon_id" TO "anonId"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "restaurant_id" TO "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "restaurantId" TYPE uuid USING "restaurantId"::uuid`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "created_at" TO "createdAt"`);
        await queryRunner.query(`ALTER TABLE "customers" RENAME COLUMN "updated_at" TO "updatedAt"`);

        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "restaurant_id" TO "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "restaurantId" TYPE uuid USING "restaurantId"::uuid`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "waiter_id" TO "waiterId"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "waiterId" TYPE uuid USING "waiterId"::uuid`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "table_id" TO "tableId"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "tableId" TYPE uuid USING "tableId"::uuid`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "customer_id" TO "customerId"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "customerId" TYPE uuid USING "customerId"::uuid`);

        await queryRunner.query(`ALTER TABLE "tables" RENAME COLUMN "restaurant_id" TO "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "restaurantId" TYPE uuid USING "restaurantId"::uuid`);
        await queryRunner.query(`ALTER TABLE "tables" RENAME COLUMN "waiter_id" TO "waiterId"`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "waiterId" TYPE uuid USING "waiterId"::uuid`);

        // UpsellRule restaurantId
        // Delete to avoid constraint issues on new column
        await queryRunner.query(`DELETE FROM "upsell_rules"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD "restaurantId" uuid NOT NULL`);

        // Recreate FKs
        await queryRunner.query(`ALTER TABLE "menu_items" ADD CONSTRAINT "FK_a6b42bf45dbdef19cbf05a4cacf" FOREIGN KEY ("menuId") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_7895dd6155ca5de93ff02d6791a" FOREIGN KEY ("triggerProductId") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_59d957dd92b459f1babc395cfca" FOREIGN KEY ("upgradeProductId") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_40e345386a4e9873a2c86aa40b3" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "waiters" ADD CONSTRAINT "FK_96211362bd3896fa53db1b69953" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_4ca7f2f579cda8a6158c7fc1650" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_d8453d5a71e525d9b406c35aab8" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_a1a02d2ca991de8d72e402972d1" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2a7fdd7af437285a3ef0fc8b64f" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2312cd07a04f50ba29d76c9564e" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2912d5ae4c5a140b02c1f0c7611" FOREIGN KEY ("waiterId") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_94e0a6541322cecd437cd841701" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_e0d21fc2aaf97ec5e9ebbed2cfb" FOREIGN KEY ("waiterId") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(_queryRunner: QueryRunner): Promise<void> {
        // Down migration not implemented
    }
}
