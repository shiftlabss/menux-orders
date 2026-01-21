import { DailyMetric } from '../entities/DailyMetric';

export interface IDailyMetricRepository {
    findByRestaurantAndDate(restaurantId: string, date: string): Promise<DailyMetric | null>;
    save(metric: DailyMetric): Promise<DailyMetric>;
}
