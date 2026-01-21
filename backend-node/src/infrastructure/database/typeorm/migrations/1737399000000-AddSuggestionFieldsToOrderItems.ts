import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSuggestionFieldsToOrderItems1737399000000 implements MigrationInterface {
    name = 'AddSuggestionFieldsToOrderItems1737399000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "is_suggestion" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "suggestion_type" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "suggestion_type"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "is_suggestion"`);
    }

}
