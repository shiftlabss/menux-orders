import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { Order } from '@domain/entities/Order';
import { UpdateRestaurantDailyMetrics } from '@application/use-cases/analytics/UpdateRestaurantDailyMetrics';
import { AppError } from '../../../shared/errors';

interface IUpdateOrderRequest {
    orderId: string;
    restaurantId: string; // Security check
    tableId?: string;
    waiterId?: string;
    status?: string;
}

export class UpdateOrder {
    constructor(
        private orderRepository: IOrderRepository,
        private updateRestaurantDailyMetrics: UpdateRestaurantDailyMetrics
    ) { }

    async execute({ orderId, restaurantId, tableId, waiterId, status }: IUpdateOrderRequest): Promise<Order> {
        const order = await this.orderRepository.findById(orderId);

        if (!order) {
            throw new AppError('Order not found.', 404);
        }

        if (order.restaurantId !== restaurantId && order.restaurant?.id !== restaurantId) {
            // Basic ownership check
            // Note: findById might load relation, verify how it's loaded.
            // If Order entity has restaurantId column mapped, we can check that.
            throw new AppError('Order does not belong to this restaurant.', 403);
        }

        if (tableId !== undefined) {
            order.tableId = tableId;
        }

        if (waiterId !== undefined) {
            order.waiterId = waiterId;
        }

        // Allow updating status here too if needed, though we have a specific patch route for it
        if (status) {
            // Validate status enum if strict
            order.status = status as any;
        }

        const savedOrder = await this.orderRepository.save(order);

        await this.updateRestaurantDailyMetrics.execute(restaurantId, savedOrder.createdAt);

        return savedOrder;
    }
}
