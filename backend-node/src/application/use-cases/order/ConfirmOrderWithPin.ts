import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IWaiterRepository } from '@domain/repositories/IWaiterRepository';
import { Order, OrderStatus } from '@domain/entities/Order';
import { UpdateRestaurantDailyMetrics } from '@application/use-cases/analytics/UpdateRestaurantDailyMetrics';
import { AppError } from '../../../shared/errors';

interface IRequest {
    orderId: string;
    pinCode: string;
    restaurantId: string;
}

export class ConfirmOrderWithPin {
    constructor(
        private orderRepository: IOrderRepository,
        private waiterRepository: IWaiterRepository,
        private updateRestaurantDailyMetrics: UpdateRestaurantDailyMetrics
    ) { }

    async execute({ orderId, pinCode, restaurantId }: IRequest): Promise<Order> {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new AppError('Order not found.', 404);
        }

        if (order.restaurantId !== restaurantId) {
            throw new AppError('Order does not belong to this restaurant.', 403);
        }

        const waiter = await this.waiterRepository.findByPinCode(restaurantId, pinCode);

        if (!waiter) {
            throw new AppError('Invalid PIN code.', 401);
        }

        order.waiterId = waiter.id;

        // If the order is waiting, move it to preparing
        if (order.status === OrderStatus.WAITING) {
            order.status = OrderStatus.PREPARING;
        }

        const savedOrder = await this.orderRepository.save(order);

        await this.updateRestaurantDailyMetrics.execute(restaurantId, savedOrder.createdAt);

        return savedOrder;
    }
}
