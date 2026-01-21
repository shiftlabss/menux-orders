import { MigrationInterface, QueryRunner } from "typeorm";

export class FixWaiterAndPasswordNullable1768229630685 implements MigrationInterface {
    name = 'FixWaiterAndPasswordNullable1768229630685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_pai_categories"`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP CONSTRAINT "FK_waiters_restaurant_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_waiter_id"`);
        await queryRunner.query(`ALTER TABLE "waiters" ALTER COLUMN "password" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP COLUMN "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "waiters" ADD "restaurantId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "waiterId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "waiterId" character varying`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_64dfd0fe466eff96a09ff4b10ac" FOREIGN KEY ("pai") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "waiters" ADD CONSTRAINT "FK_775bbd2a9d923cda519732eb788" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_1aeeb86b9610f47f8a28e2be1db" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1aeeb86b9610f47f8a28e2be1db"`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP CONSTRAINT "FK_775bbd2a9d923cda519732eb788"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_64dfd0fe466eff96a09ff4b10ac"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "waiterId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "waiterId" uuid`);
        await queryRunner.query(`ALTER TABLE "waiters" DROP COLUMN "restaurantId"`);
        await queryRunner.query(`ALTER TABLE "waiters" ADD "restaurantId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "waiters" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_waiter_id" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "waiters" ADD CONSTRAINT "FK_waiters_restaurant_id" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_pai_categories" FOREIGN KEY ("pai") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
