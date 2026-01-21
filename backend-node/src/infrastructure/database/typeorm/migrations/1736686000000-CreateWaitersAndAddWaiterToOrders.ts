import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWaitersAndAddWaiterToOrders1736686000000 implements MigrationInterface {
    name = 'CreateWaitersAndAddWaiterToOrders1736686000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "waiters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "nickname" character varying, "avatarUrl" character varying, "pinCode" character varying(4) NOT NULL, "password" character varying NOT NULL, "restaurant_id" uuid, "restaurantId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_waiters_id" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "waiters" ADD CONSTRAINT "FK_waiters_restaurant_id" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        await queryRunner.query(`ALTER TABLE "orders" ADD "waiter_id" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "waiterId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_waiter_id" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_waiter_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "waiterId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "waiter_id"`);

        await queryRunner.query(`ALTER TABLE "waiters" DROP CONSTRAINT "FK_waiters_restaurant_id"`);
        await queryRunner.query(`DROP TABLE "waiters"`);
    }

}
