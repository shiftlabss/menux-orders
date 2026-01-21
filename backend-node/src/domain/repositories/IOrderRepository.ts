import { Order } from '../entities/Order';

export interface IOrderRepository {
    findById(id: string): Promise<Order | undefined>;
    save(order: Order): Promise<Order>;
    listByRestaurant(restaurantId: string): Promise<Order[]>;
    findByTransactionId(transactionId: string): Promise<Order | undefined>;
    existsByCodeInLast24h(code: string, restaurantId: string): Promise<boolean>;
    findByCustomerInLast24h(customerId: string, restaurantId: string): Promise<Order[]>;
    findByTemporaryCustomerInLast24h(temporaryCustomerId: string, restaurantId: string): Promise<Order[]>;
    calculateDailyMetrics(restaurantId: string, date: Date): Promise<{ totalOrders: number; totalRevenue: number; averageDecisionTime: number }>;
    getSalesByProduct(restaurantId: string, startDate: Date, endDate: Date): Promise<{ menuItemId: string; totalSold: number; totalRevenue: number }[]>;
    findByDateRange(restaurantId: string, startDate: Date, endDate: Date, status?: string): Promise<Order[]>;
    findSoldItemsByDateRange(restaurantId: string, startDate: Date, endDate: Date, isSuggestion?: boolean): Promise<any[]>;
    listByRestaurantCompact(restaurantId: string, includeItems?: boolean): Promise<Order[]>;
}
