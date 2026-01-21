import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order } from '@domain/entities/Order';

interface IRequest {
    restaurantId: string;
    temporaryCustomerId: string;
}

export class ListTemporaryCustomerOrders {
    constructor(
        private orderRepository: IOrderRepository
    ) { }

    async execute({ restaurantId, temporaryCustomerId }: IRequest): Promise<Order[]> {
        return this.orderRepository.findByTemporaryCustomerInLast24h(temporaryCustomerId, restaurantId);
    }
}
