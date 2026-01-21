
import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateUpsellRules1768235643700 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'upsell_rules',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                    },
                    {
                        name: 'trigger_product_id',
                        type: 'uuid',
                    },
                    {
                        name: 'upgrade_product_id',
                        type: 'uuid',
                    },
                    {
                        name: 'isActive',
                        type: 'boolean',
                        default: true,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            'upsell_rules',
            new TableForeignKey({
                columnNames: ['trigger_product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'menu_items',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'upsell_rules',
            new TableForeignKey({
                columnNames: ['upgrade_product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'menu_items',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('upsell_rules');
        if (!table) return;

        const triggerForeignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('trigger_product_id') !== -1
        );
        const upgradeForeignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf('upgrade_product_id') !== -1
        );

        if (triggerForeignKey) {
            await queryRunner.dropForeignKey('upsell_rules', triggerForeignKey);
        }
        if (upgradeForeignKey) {
            await queryRunner.dropForeignKey('upsell_rules', upgradeForeignKey);
        }

        await queryRunner.dropTable('upsell_rules');
    }
}
