import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBusinessFieldsToRestaurants1736681000000 implements MigrationInterface {
    name = 'AddBusinessFieldsToRestaurants1736681000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "cnpj" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "tradingName" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "corporateName" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "logoUrl" text`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "description" text`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "phone" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "openingHours" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "instagram" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "facebook" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "whatsapp" character varying`);
        await queryRunner.query(`ALTER TABLE "restaurants" ADD "website" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "website"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "whatsapp"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "facebook"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "instagram"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "openingHours"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "logoUrl"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "corporateName"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "tradingName"`);
        await queryRunner.query(`ALTER TABLE "restaurants" DROP COLUMN "cnpj"`);
    }

}
