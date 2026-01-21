
import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class SeedUpsellRules1768235643750 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Fetch menu items
        const items = await queryRunner.query('SELECT id, name FROM menu_items LIMIT 20');

        if (!items || items.length < 2) {
            // Fallback if no items exist, though unlikely given other seeds
            return;
        }

        // Generate some realistic-looking rules based on whatever items we found
        // We'll just take pairs
        const rulesCount = Math.floor(items.length / 2);

        for (let i = 0; i < rulesCount; i++) {
            const trigger = items[i];
            const upgrade = items[items.length - 1 - i]; // Pair from end

            // Avoid self-reference if odd number or overlap
            if (trigger.id === upgrade.id) continue;

            await queryRunner.query(`
                INSERT INTO upsell_rules (id, name, trigger_product_id, upgrade_product_id, "isActive")
                VALUES ('${uuidv4()}', 'Upsell Auto Generated ${i + 1}', '${trigger.id}', '${upgrade.id}', true)
             `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DELETE FROM upsell_rules');
    }
}
