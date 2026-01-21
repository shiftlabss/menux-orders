import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order } from '@domain/entities/Order';

export class ListOrdersByDateRange {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute(restaurantId: string, startDateStr: string, endDateStr: string, status?: string): Promise<Order[]> {
        // Parse dates safely
        const startDate = new Date(startDateStr);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);

        return this.orderRepository.findByDateRange(restaurantId, startDate, endDate, status);
    }
}
