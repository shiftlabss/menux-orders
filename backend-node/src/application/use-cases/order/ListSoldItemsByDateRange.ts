import { IOrderRepository } from '@domain/repositories/IOrderRepository';

export class ListSoldItemsByDateRange {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute(restaurantId: string, startDateStr: string, endDateStr: string, isSuggestion?: boolean): Promise<any[]> {
        const startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);

        return this.orderRepository.findSoldItemsByDateRange(restaurantId, startDate, endDate, isSuggestion);
    }
}
