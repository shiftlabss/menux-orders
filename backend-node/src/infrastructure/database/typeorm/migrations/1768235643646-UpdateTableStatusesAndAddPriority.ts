import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTableStatusesAndAddPriority1768235643646 implements MigrationInterface {
    name = 'UpdateTableStatusesAndAddPriority1768235643646'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create Table Priority Enum
        await queryRunner.query(`CREATE TYPE "public"."tables_priority_enum" AS ENUM('MEDIUM', 'HIGH')`);

        // 2. Add Priority Column
        await queryRunner.query(`ALTER TABLE "tables" ADD "priority" "public"."tables_priority_enum"`);

        // 3. Update Existing Statuses to Priorities if necessary
        // Mapping: AVERAGE status -> OCCUPIED status + MEDIUM priority
        // Mapping: HIGH status -> OCCUPIED status + HIGH priority
        await queryRunner.query(`UPDATE "tables" SET "priority" = 'MEDIUM', "status" = 'OCCUPIED' WHERE "status" = 'AVERAGE'`);
        await queryRunner.query(`UPDATE "tables" SET "priority" = 'HIGH', "status" = 'OCCUPIED' WHERE "status" = 'HIGH'`);

        // 4. Update other statuses that are being removed
        await queryRunner.query(`UPDATE "tables" SET "status" = 'FREE' WHERE "status" IN ('INACTIVE', 'RESERVED', 'IDLE')`);

        // 5. Update Table Status Enum
        await queryRunner.query(`ALTER TYPE "public"."tables_status_enum" RENAME TO "tables_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."tables_status_enum" AS ENUM('FREE', 'OCCUPIED', 'CLOSING', 'CLOSED')`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "status" TYPE "public"."tables_status_enum" USING "status"::"text"::"public"."tables_status_enum"`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "status" SET DEFAULT 'FREE'`);
        await queryRunner.query(`DROP TYPE "public"."tables_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tables_status_enum_old" AS ENUM('INACTIVE', 'FREE', 'OCCUPIED', 'AVERAGE', 'HIGH', 'CLOSING', 'CLOSED', 'RESERVED', 'IDLE')`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "status" TYPE "public"."tables_status_enum_old" USING "status"::"text"::"public"."tables_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "tables" ALTER COLUMN "status" SET DEFAULT 'FREE'`);
        await queryRunner.query(`DROP TYPE "public"."tables_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."tables_status_enum_old" RENAME TO "tables_status_enum"`);

        await queryRunner.query(`ALTER TABLE "tables" DROP COLUMN "priority"`);
        await queryRunner.query(`DROP TYPE "public"."tables_priority_enum"`);
    }
}
