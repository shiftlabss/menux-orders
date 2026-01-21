import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class EnforceNonNullMenuId1768241000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Delete items without imageUrl
        // First delete from order_items to avoid FK violation
        await queryRunner.query(`
            DELETE FROM "order_items" 
            WHERE "menu_item_id" IN (
                SELECT id FROM "menu_items" WHERE "imageUrl" IS NULL OR "imageUrl" = ''
            )
        `);

        await queryRunner.query(`DELETE FROM "menu_items" WHERE "imageUrl" IS NULL OR "imageUrl" = ''`);

        // 2. associate existing items with a menu
        // Get all unique restaurantIds from items that don't have a menuId
        const result = await queryRunner.query(`
            SELECT DISTINCT c."restaurantId"
            FROM "menu_items" mi
            INNER JOIN "categories" c ON mi."categoryId" = c.id
            WHERE mi."menuId" IS NULL
        `);

        for (const row of result) {
            const restaurantId = row.restaurantId;
            if (!restaurantId) continue;

            // Find existing menu for this restaurant
            const menus = await queryRunner.query(`
                SELECT id FROM "menus" WHERE "restaurantId" = '${restaurantId}' LIMIT 1
            `);

            let menuId: string;

            if (menus.length > 0) {
                menuId = menus[0].id;
            } else {
                // Create new menu
                // We need uuid generation. Postgres usually has uuid_generate_v4() if extension enabled, 
                // but simpler to use hardcoded uuid or just assume extension exists.
                // Let's rely on pgcrypto or uuid-ossp.
                // Or better, let's fetch a new UUID via some JS lib or a random one?
                // Creating a random UUID in TS is safer than assuming DB extension.
                // A simple placeholder UUID generator for migration:
                const crypto = require('crypto');
                menuId = crypto.randomUUID();

                await queryRunner.query(`
                    INSERT INTO "menus" ("id", "name", "restaurantId", "isActive", "createdAt", "updatedAt")
                    VALUES ('${menuId}', 'Menu Principal', '${restaurantId}', true, NOW(), NOW())
                `);
            }

            // Update all items for this restaurant
            await queryRunner.query(`
                UPDATE "menu_items"
                SET "menuId" = '${menuId}'
                FROM "categories" c
                WHERE "menu_items"."categoryId" = c.id
                AND c."restaurantId" = '${restaurantId}'
                AND "menu_items"."menuId" IS NULL
            `);
        }

        // 3. Set menuId to NOT NULL
        // We need to recreate the foreign key constraint just to be clean? 
        // No, we can just alter column. But we modify the column definition.
        // Existing column was created with isNullable: true.

        await queryRunner.changeColumn("menu_items", "menuId", new TableColumn({
            name: "menuId",
            type: "uuid",
            isNullable: false
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn("menu_items", "menuId", new TableColumn({
            name: "menuId",
            type: "uuid",
            isNullable: true
        }));
    }
}
