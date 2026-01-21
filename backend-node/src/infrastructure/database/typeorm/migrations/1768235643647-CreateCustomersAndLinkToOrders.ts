import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableColumn } from "typeorm";

export class CreateCustomersAndLinkToOrders1768235643647 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "customers",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "customer_type",
                        type: "varchar",
                        default: "'registered'",
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "email",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "phone",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "anon_id",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "origin",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "restaurant_id",
                        type: "uuid",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        await queryRunner.addColumn(
            "orders",
            new TableColumn({
                name: "customer_id",
                type: "uuid",
                isNullable: true,
            })
        );

        await queryRunner.createForeignKey(
            "orders",
            new TableForeignKey({
                columnNames: ["customer_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "customers",
                onDelete: "SET NULL",
            })
        );

        await queryRunner.createForeignKey(
            "customers",
            new TableForeignKey({
                columnNames: ["restaurant_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "restaurants",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("orders");
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("customer_id") !== -1
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey("orders", foreignKey);
            }
        }
        await queryRunner.dropColumn("orders", "customer_id");
        await queryRunner.dropTable("customers");
    }
}
