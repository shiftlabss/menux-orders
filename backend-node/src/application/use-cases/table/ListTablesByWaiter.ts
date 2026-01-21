import { ITableRepository } from '@domain/repositories/ITableRepository';
import { Table } from '@domain/entities/Table';

export class ListTablesByWaiter {
    constructor(
        private tableRepository: ITableRepository
    ) { }

    async execute(restaurantId: string, waiterId: string): Promise<Table[]> {
        const tables = await this.tableRepository.listByRestaurant(restaurantId);

        // Filter tables where the assigned waiter matches
        // Or tables that have active orders from this waiter
        return tables.filter(table =>
            table.waiterId === waiterId ||
            table.orders?.some(order => order.waiterId === waiterId)
        );
    }
}
