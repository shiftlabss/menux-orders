import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDecisionTimeColumns1737380000000 implements MigrationInterface {
    name = 'AddDecisionTimeColumns1737380000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "total_decision_time" integer`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "decision_time" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "decision_time"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "total_decision_time"`);
    }

}
