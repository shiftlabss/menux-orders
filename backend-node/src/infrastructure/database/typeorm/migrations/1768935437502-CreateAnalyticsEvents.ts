import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAnalyticsEvents1768935437502 implements MigrationInterface {
    name = 'CreateAnalyticsEvents1768935437502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT "FK_upsell_rules_restaurant"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT "FK_59d957dd92b459f1babc395cfca"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT "FK_7895dd6155ca5de93ff02d6791a"`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP CONSTRAINT "FK_96211362bd3896fa53db1b69953"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_4ca7f2f579cda8a6158c7fc1650"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_d8453d5a71e525d9b406c35aab8"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_a1a02d2ca991de8d72e402972d1"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_2912d5ae4c5a140b02c1f0c7611"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_2312cd07a04f50ba29d76c9564e"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_2a7fdd7af437285a3ef0fc8b64f"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT "FK_e0d21fc2aaf97ec5e9ebbed2cfb"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT "FK_94e0a6541322cecd437cd841701"`);
        await queryRunner.query(`ALTER TABLE "daily_metrics" DROP CONSTRAINT "FK_daily_metrics_restaurant"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_daily_metrics_restaurant_date"`);
        await queryRunner.query(`CREATE TABLE "analytics_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "timestamp" TIMESTAMP NOT NULL, "session_id" character varying NOT NULL, "item_id" character varying, "context" character varying, "name" character varying, "price" character varying, "item_count" integer, "total_value" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5d643d67a09b55653e98616f421" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "waiters" ALTER COLUMN "restaurant_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "order_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "menu_item_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "customer_type"`);
        await queryRunner.query(`CREATE TYPE "public"."customers_customer_type_enum" AS ENUM('registered', 'anonymous')`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "customer_type" "public"."customers_customer_type_enum" NOT NULL DEFAULT 'registered'`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "restaurant_id" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ecc56da9e838fd13abb3253a27" ON "daily_metrics" ("restaurant_id", "date") `);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_3d4ec36469ff3f97b558c55fba3" FOREIGN KEY ("trigger_product_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_831387c5b7fdade8d09ba8821a7" FOREIGN KEY ("upgrade_product_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_faf461c44a7b90e89bb4bdf4925" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "waiters" ADD CONSTRAINT "FK_775bbd2a9d923cda519732eb788" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2db2210c81ee6fb1c11843e18c" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_e462517174f561ece2916701c0a" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_76038a7f0cc133ac7d2c387a7cf" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_3d36410e89a795172fa6e0dd968" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_85fdda5fcce2f397ef8f117a2c6" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1aeeb86b9610f47f8a28e2be1db" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_77e362d578933cf4518770d11ae" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_b520ec91c6e8486f51551d54129" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_metrics" ADD CONSTRAINT "FK_7556e12f586d9594a78be09234a" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_metrics" DROP CONSTRAINT "FK_7556e12f586d9594a78be09234a"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT "FK_b520ec91c6e8486f51551d54129"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT "FK_77e362d578933cf4518770d11ae"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1aeeb86b9610f47f8a28e2be1db"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_85fdda5fcce2f397ef8f117a2c6"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_3d36410e89a795172fa6e0dd968"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_772d0ce0473ac2ccfa26060dbe9"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_76038a7f0cc133ac7d2c387a7cf"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_e462517174f561ece2916701c0a"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2db2210c81ee6fb1c11843e18c"`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP CONSTRAINT "FK_775bbd2a9d923cda519732eb788"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT "FK_faf461c44a7b90e89bb4bdf4925"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT "FK_831387c5b7fdade8d09ba8821a7"`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" DROP CONSTRAINT "FK_3d4ec36469ff3f97b558c55fba3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ecc56da9e838fd13abb3253a27"`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "restaurant_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "customer_type"`);
        await queryRunner.query(`DROP TYPE "public"."customers_customer_type_enum"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "customer_type" character varying NOT NULL DEFAULT 'registered'`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "menu_item_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "order_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "waiters" ALTER COLUMN "restaurant_id" DROP NOT NULL`);
        await queryRunner.query(`DROP TABLE "analytics_events"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_daily_metrics_restaurant_date" ON "daily_metrics" ("restaurant_id", "date") `);
        await queryRunner.query(`ALTER TABLE "daily_metrics" ADD CONSTRAINT "FK_daily_metrics_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_94e0a6541322cecd437cd841701" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_e0d21fc2aaf97ec5e9ebbed2cfb" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2a7fdd7af437285a3ef0fc8b64f" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2312cd07a04f50ba29d76c9564e" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_2912d5ae4c5a140b02c1f0c7611" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_a1a02d2ca991de8d72e402972d1" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_d8453d5a71e525d9b406c35aab8" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_4ca7f2f579cda8a6158c7fc1650" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "waiters" ADD CONSTRAINT "FK_96211362bd3896fa53db1b69953" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_7895dd6155ca5de93ff02d6791a" FOREIGN KEY ("trigger_product_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_59d957dd92b459f1babc395cfca" FOREIGN KEY ("upgrade_product_id") REFERENCES "menu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "upsell_rules" ADD CONSTRAINT "FK_upsell_rules_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
