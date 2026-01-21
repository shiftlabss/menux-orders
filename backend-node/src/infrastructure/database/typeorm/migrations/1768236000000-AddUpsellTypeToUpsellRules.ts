import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddUpsellTypeToUpsellRules1768236000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("upsell_rules", new TableColumn({
            name: "upsell_type",
            type: "varchar",
            default: "'upsell'",
            isNullable: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("upsell_rules", "upsell_type");
    }

}
