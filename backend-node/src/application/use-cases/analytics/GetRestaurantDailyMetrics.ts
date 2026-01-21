
import { DailyMetric } from '@domain/entities/DailyMetric';
import { ICachePort } from '@application/ports/ICachePort';
import { UpdateRestaurantDailyMetrics } from './UpdateRestaurantDailyMetrics';

export class GetRestaurantDailyMetrics {
    constructor(
        private updateRestaurantDailyMetrics: UpdateRestaurantDailyMetrics,
        private cachePort: ICachePort
    ) { }

    async execute(restaurantId: string): Promise<DailyMetric> {
        const dateString = new Date().toISOString().split('T')[0];
        const cacheKey = `restaurant:${restaurantId}:metrics:${dateString}`;

        // 1. Try Cache
        const cached = await this.cachePort.get<DailyMetric>(cacheKey);
        if (cached) {
            return cached;
        }

        // 2. Force Update/Calculate (Cache Miss for Today)
        // Since this use case is for "Current/Today" metrics, if we miss the cache, 
        // we should recalculate to ensure freshness rather than returning a potentially stale DB snapshot.
        const metric = await this.updateRestaurantDailyMetrics.execute(restaurantId, new Date());

        return metric;
    }
}
