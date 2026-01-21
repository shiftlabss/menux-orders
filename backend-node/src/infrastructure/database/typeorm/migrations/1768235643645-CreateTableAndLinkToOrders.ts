import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableAndLinkToOrders1768235643645 implements MigrationInterface {
    name = 'CreateTableAndLinkToOrders1768235643645'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tables_status_enum" AS ENUM('INACTIVE', 'FREE', 'OCCUPIED', 'AVERAGE', 'HIGH', 'CLOSING', 'CLOSED', 'RESERVED', 'IDLE')`);
        await queryRunner.query(`CREATE TABLE "tables" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "number" integer NOT NULL, "status" "public"."tables_status_enum" NOT NULL DEFAULT 'FREE', "capacity" integer NOT NULL DEFAULT '0', "currentPeople" integer NOT NULL DEFAULT '0', "openedAt" TIMESTAMP, "closedAt" TIMESTAMP, "restaurantId" character varying NOT NULL, "waiterId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "restaurant_id" uuid, "waiter_id" uuid, CONSTRAINT "PK_7cf2aca7af9550742f855d4eb69" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "tableId" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "table_id" uuid`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('WAITING', 'PREPARING', 'READY', 'DELIVERED', 'FINISHED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'WAITING'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_3d36410e89a795172fa6e0dd968" FOREIGN KEY ("table_id") REFERENCES "tables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_77e362d578933cf4518770d11ae" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tables" ADD CONSTRAINT "FK_b520ec91c6e8486f51551d54129" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT "FK_b520ec91c6e8486f51551d54129"`);
        await queryRunner.query(`ALTER TABLE "tables" DROP CONSTRAINT "FK_77e362d578933cf4518770d11ae"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_3d36410e89a795172fa6e0dd968"`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum_old" AS ENUM('WAITING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELED')`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'WAITING'`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "table_id"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "tableId"`);
        await queryRunner.query(`DROP TABLE "tables"`);
        await queryRunner.query(`DROP TYPE "public"."tables_status_enum"`);
    }

}
