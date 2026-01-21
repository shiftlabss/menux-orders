import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order } from '@domain/entities/Order';

export class ListOrdersByRestaurant {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute(restaurantId: string): Promise<Order[]> {
        return this.orderRepository.listByRestaurant(restaurantId);
    }
}
