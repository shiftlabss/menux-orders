import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddHeaderUrlToRestaurants1737295000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("restaurants", new TableColumn({
            name: "headerUrl",
            type: "text",
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("restaurants", "headerUrl");
    }

}
