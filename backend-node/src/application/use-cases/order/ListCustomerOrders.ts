import { Order } from '@domain/entities/Order';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';

interface IRequest {
    customerId: string;
    restaurantId: string;
}

export class ListCustomerOrders {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute({ customerId, restaurantId }: IRequest): Promise<Order[]> {
        return await this.orderRepository.findByCustomerInLast24h(customerId, restaurantId);
    }
}
