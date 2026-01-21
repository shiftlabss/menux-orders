import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCodeAndIngredientsToMenuItems1767964500000 implements MigrationInterface {
    name = 'AddCodeAndIngredientsToMenuItems1767964500000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "menu_items" ADD "code" character varying`);
        await queryRunner.query(`ALTER TABLE "menu_items" ADD "ingredients" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "ingredients"`);
        await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "code"`);
    }

}
