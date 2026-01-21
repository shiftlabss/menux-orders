import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order } from '@domain/entities/Order';

export class ListOrdersByWaiter {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute(restaurantId: string, waiterId: string): Promise<Order[]> {
        const orders = await this.orderRepository.listByRestaurant(restaurantId);
        return orders.filter(order => order.waiterId === waiterId);
    }
}
