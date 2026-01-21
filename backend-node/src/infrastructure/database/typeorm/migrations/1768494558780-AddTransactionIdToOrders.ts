import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTransactionIdToOrders1768494558780 implements MigrationInterface {
    name = 'AddTransactionIdToOrders1768494558780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('orders', new TableColumn({
            name: 'transaction_id',
            type: 'uuid',
            isNullable: true,
            isUnique: true
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('orders', 'transaction_id');
    }
}
