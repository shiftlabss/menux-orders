import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { IMenuRepository } from '@domain/repositories/IMenuRepository';
import { Order, OrderStatus } from '@domain/entities/Order';
import { OrderItem } from '@domain/entities/OrderItem';
import { AppError } from '../../../shared/errors';
import { ICachePort } from '@application/ports/ICachePort';
import { UpdateRestaurantDailyMetrics } from '@application/use-cases/analytics/UpdateRestaurantDailyMetrics';

interface ICreateOrderRequest {
    restaurantId: string;
    items: {
        menuItemId: string;
        quantity: number;
        observation?: string;
        decisionTime?: number;
        isSuggestion?: boolean;
        suggestionType?: string;
    }[];
    kpis?: {
        totalDecisionTime?: number;
    };
    tableId?: string;
    waiterId?: string;
    customerName?: string;
    tableNumber?: string;
    transactionId?: string;
    customerId?: string;
    temporaryCustomerId?: string;
}


export class CreateOrder {
    constructor(
        private orderRepository: IOrderRepository,
        private menuRepository: IMenuRepository,
        private cachePort: ICachePort,
        private updateRestaurantDailyMetrics: UpdateRestaurantDailyMetrics
    ) { }

    async execute({ restaurantId, items, tableId, waiterId, tableNumber, transactionId, customerId, temporaryCustomerId, kpis }: ICreateOrderRequest): Promise<Order> {
        // 1. Idempotency Check
        if (transactionId) {
            const existingOrder = await this.orderRepository.findByTransactionId(transactionId);
            if (existingOrder) {
                return existingOrder;
            }
        }

        if (!items || items.length === 0) {
            throw new AppError('Order must have at least one item.');
        }

        const order = new Order();
        order.restaurantId = restaurantId;
        order.status = OrderStatus.WAITING;
        order.tableNumber = tableNumber ? String(tableNumber) : null;
        order.transactionId = transactionId || null;
        order.customerId = customerId || null;
        order.customerId = customerId || null;
        order.temporaryCustomerId = temporaryCustomerId || null;

        if (kpis && kpis.totalDecisionTime) {
            order.totalDecisionTime = kpis.totalDecisionTime;
        }

        // 2. Atomic Order Code Generation via Redis
        // Key format: restaurant:{id}:order_counter
        // This ensures sequential, unique numbers without collisions.
        const counterKey = `restaurant:${restaurantId}:order_counter`;
        const nextOrderNumber = await this.cachePort.incr(counterKey);

        // Format to string, e.g. "1001", "1002" or just simple number 
        // If we want to simulate the 4-digit code (e.g. 0001) or just meaningful number
        // Let's assume just the number as string for now, or pad it if needed.
        // User asked for "Atomic counter funcione", usually implies just sequential.
        // If we want to reset daily, we would need a key with date, e.g. `restaurant:${id}:date:${today}:order_counter`
        // But for "last 24h" uniqueness or general sequence, a global increment is safest for now.
        order.code = nextOrderNumber.toString();

        if (tableId) {
            order.tableId = tableId;
        }

        if (waiterId) {
            order.waiterId = waiterId;
        }

        // We are relying on the cascade to save items, but we need to fetch info first
        order.items = [];
        let total = 0;

        for (const itemData of items) {
            const menuItem = await this.menuRepository.findItemById(itemData.menuItemId);

            if (!menuItem) {
                throw new AppError(`Menu item not found: ${itemData.menuItemId}`);
            }

            const orderItem = new OrderItem();
            orderItem.menuItem = menuItem;
            orderItem.quantity = itemData.quantity;
            orderItem.price = menuItem.price; // Use current price
            orderItem.observation = itemData.observation || '';

            if (itemData.decisionTime) {
                orderItem.decisionTime = itemData.decisionTime;
            }

            if (itemData.isSuggestion !== undefined) {
                orderItem.isSuggestion = itemData.isSuggestion;
            }

            if (itemData.suggestionType) {
                orderItem.suggestionType = itemData.suggestionType;
            }

            total += Number(menuItem.price) * itemData.quantity;
            order.items.push(orderItem);
        }

        order.total = total;

        const savedOrder = await this.orderRepository.save(order);

        // User Request: Always recalculate for the order date
        await this.updateRestaurantDailyMetrics.execute(restaurantId, savedOrder.createdAt);

        return savedOrder;
    }
}
