import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParentIdToCategories1767964100000 implements MigrationInterface {
    name = 'AddParentIdToCategories1767964100000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" ADD "pai" uuid`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_pai_categories" FOREIGN KEY ("pai") REFERENCES "categories"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_pai_categories"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "pai"`);
    }

}
