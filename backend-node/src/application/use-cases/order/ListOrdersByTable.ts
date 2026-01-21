import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order } from '@domain/entities/Order';

export class ListOrdersByTable {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute(restaurantId: string, tableId: string): Promise<Order[]> {
        const orders = await this.orderRepository.listByRestaurant(restaurantId);
        return orders.filter(order => order.tableId === tableId);
    }
}
