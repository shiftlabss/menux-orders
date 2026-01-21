import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTemporaryCustomerIdToOrders1737300000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("orders", new TableColumn({
            name: "temporary_customer_id",
            type: "varchar", // Using varchar to be flexible, but could be uuid
            isNullable: true,
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("orders", "temporary_customer_id");
    }

}
