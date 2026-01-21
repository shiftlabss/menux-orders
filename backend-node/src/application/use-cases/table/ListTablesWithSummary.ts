import { ITableRepository } from '@domain/repositories/ITableRepository';
import { OrderStatus } from '@domain/entities/Order';

export class ListTablesWithSummary {
    constructor(
        private tableRepository: ITableRepository
    ) { }

    async execute(restaurantId: string): Promise<any[]> {
        const tables = await this.tableRepository.listByRestaurant(restaurantId);

        return tables.map(table => {
            const activeOrders = table.orders?.filter(order =>
                order.status !== OrderStatus.CANCELED &&
                order.status !== OrderStatus.FINISHED
            ) || [];

            const totalConsumption = activeOrders.reduce((acc, order) => acc + Number(order.total), 0);
            const totalItemsCount = activeOrders.reduce((acc, order) => {
                const itemCount = order.items?.reduce((itemAcc, item) => itemAcc + item.quantity, 0) || 0;
                return acc + itemCount;
            }, 0);

            // Calculate Suggestion Conversion (Accepted / Displayed)
            // Assuming we track 'displayed' elsewhere or use a simple proxy: 
            // rate = (items marked as isSuggestion / total items) * 100 for now, 
            // OR if 'suggestionType' exists, it means it was a suggestion.
            const suggestionItems = activeOrders.reduce((acc, order) => {
                return acc + (order.items?.filter(i => i.isSuggestion).length || 0);
            }, 0);

            // Proxy for 'opportunities displayed' could be total items (assuming every item had an opportunity? no that's wrong).
            // Better: Just return the count of accepted suggestions for now, or if we had analytics connected here.
            // Let's return the simplified conversion % based on total items (e.g. 20% of items are upselling)
            const suggestionConversionRate = totalItemsCount > 0 ? (suggestionItems / totalItemsCount) * 100 : 0;

            // Waiter of the last order
            const lastOrderWithWaiter = [...activeOrders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).find(o => o.waiter);
            const activeWaiter = lastOrderWithWaiter?.waiter || table.waiter;

            return {
                id: table.id,
                number: table.number,
                status: table.status,
                priority: table.priority,
                capacity: table.capacity,
                currentPeople: table.currentPeople,
                openedAt: table.openedAt,
                closedAt: table.closedAt,
                waiter: activeWaiter ? {
                    id: activeWaiter.id,
                    name: activeWaiter.name,
                    nickname: activeWaiter.nickname,
                } : null,
                summary: {
                    totalConsumption,
                    totalItemsCount,
                    ordersCount: activeOrders.length,
                    suggestionConversionRate
                }
            };
        });
    }
}
