import { IDailyMetricRepository } from '@domain/repositories/IDailyMetricRepository';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { DailyMetric } from '@domain/entities/DailyMetric';
import { ICachePort } from '@application/ports/ICachePort';

export class UpdateRestaurantDailyMetrics {
    constructor(
        private dailyMetricRepository: IDailyMetricRepository,
        private orderRepository: IOrderRepository,
        private cachePort: ICachePort
    ) { }

    async execute(restaurantId: string, date: Date = new Date()): Promise<DailyMetric> {
        // Normalize date to string YYYY-MM-DD for storage/lookup
        const dateString = date.toISOString().split('T')[0];

        // 1. Calculate metrics from Orders for that day
        const calculations = await this.orderRepository.calculateDailyMetrics(restaurantId, date);

        // 2. Find existing metric or create new
        let metric = await this.dailyMetricRepository.findByRestaurantAndDate(restaurantId, dateString);

        if (!metric) {
            metric = new DailyMetric();
            metric.restaurantId = restaurantId;
            metric.date = dateString;
        }

        // 3. Update fields
        metric.totalOrders = calculations.totalOrders;
        metric.totalRevenue = calculations.totalRevenue;
        metric.averageDecisionTime = calculations.averageDecisionTime;

        // Avoid division by zero
        if (metric.totalOrders > 0) {
            metric.averageTicket = metric.totalRevenue / metric.totalOrders;
        } else {
            metric.averageTicket = 0;
        }

        // 4. Save
        // 4. Save
        const savedMetric = await this.dailyMetricRepository.save(metric);

        // 5. Update Cache
        // Key: restaurant:{id}:metrics:{date}
        const cacheKey = `restaurant:${restaurantId}:metrics:${dateString}`;

        const nowString = new Date().toISOString().split('T')[0];
        const ttl = dateString === nowString ? 300 : 86400; // 5 min for today, 24h for past

        await this.cachePort.set(cacheKey, savedMetric, ttl);

        return savedMetric;
    }
}
