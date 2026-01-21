import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class LinkMenuItemsToMenu1768240000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("menu_items", new TableColumn({
            name: "menuId",
            type: "uuid",
            isNullable: true
        }));

        await queryRunner.createForeignKey("menu_items", new TableForeignKey({
            columnNames: ["menuId"],
            referencedColumnNames: ["id"],
            referencedTableName: "menus",
            onDelete: "SET NULL"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("menu_items");
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf("menuId") !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey("menu_items", foreignKey);
        }
        await queryRunner.dropColumn("menu_items", "menuId");
    }
}
