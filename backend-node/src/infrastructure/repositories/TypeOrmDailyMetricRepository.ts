import { Repository } from 'typeorm';
import { IDailyMetricRepository } from '@domain/repositories/IDailyMetricRepository';
import { DailyMetric } from '@domain/entities/DailyMetric';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmDailyMetricRepository implements IDailyMetricRepository {
    private repository: Repository<DailyMetric>;

    constructor() {
        this.repository = AppDataSource.getRepository(DailyMetric);
    }

    async findByRestaurantAndDate(restaurantId: string, date: string): Promise<DailyMetric | null> {
        return this.repository.findOne({
            where: { restaurantId, date }
        });
    }

    async save(metric: DailyMetric): Promise<DailyMetric> {
        return this.repository.save(metric);
    }
}
