import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order } from '@domain/entities/Order';

export class ListOrdersByRestaurantCompact {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute(restaurantId: string, includeItems: boolean): Promise<Order[]> {
        return this.orderRepository.listByRestaurantCompact(restaurantId, includeItems);
    }
}
