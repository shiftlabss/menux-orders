import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeImageUrlToTextInMenuItems1767965300000 implements MigrationInterface {
    name = 'ChangeImageUrlToTextInMenuItems1767965300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "menu_items" ALTER COLUMN "imageUrl" TYPE text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "menu_items" ALTER COLUMN "imageUrl" TYPE character varying`);
    }

}
