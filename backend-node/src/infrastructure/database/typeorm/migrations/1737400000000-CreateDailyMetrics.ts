import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDailyMetrics1737400000000 implements MigrationInterface {
    name = 'CreateDailyMetrics1737400000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "daily_metrics" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "restaurant_id" uuid NOT NULL,
            "date" date NOT NULL,
            "total_orders" integer NOT NULL DEFAULT '0',
            "total_revenue" numeric(10,2) NOT NULL DEFAULT '0',
            "average_ticket" numeric(10,2) NOT NULL DEFAULT '0',
            "average_decision_time" double precision NOT NULL DEFAULT '0',
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_daily_metrics_id" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_daily_metrics_restaurant_date" ON "daily_metrics" ("restaurant_id", "date")`);

        await queryRunner.query(`ALTER TABLE "daily_metrics" ADD CONSTRAINT "FK_daily_metrics_restaurant" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "daily_metrics" DROP CONSTRAINT "FK_daily_metrics_restaurant"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_daily_metrics_restaurant_date"`);
        await queryRunner.query(`DROP TABLE "daily_metrics"`);
    }

}
