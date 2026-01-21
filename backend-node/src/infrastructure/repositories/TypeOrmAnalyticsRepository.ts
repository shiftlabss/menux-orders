import { AppDataSource } from '../database/typeorm/data-source';
import { AnalyticsEvent } from '@domain/entities/AnalyticsEvent';

export class TypeOrmAnalyticsRepository {
    private repository = AppDataSource.getRepository(AnalyticsEvent);

    async saveBatch(events: any[]): Promise<void> {
        const analyticsEvents = events.map(eventData => {
            const event = new AnalyticsEvent();
            event.type = eventData.type;
            event.timestamp = new Date(eventData.timestamp);
            event.sessionId = eventData.sessionId;
            event.itemId = eventData.itemId;
            event.context = eventData.context;
            event.name = eventData.name;
            event.price = eventData.price;
            event.itemCount = eventData.itemCount;
            event.totalValue = eventData.totalValue;
            return event;
        });

        await this.repository.save(analyticsEvents);
    }

    async getEventsSummaryByProduct(startDate: Date, endDate: Date, types: string[]): Promise<{ itemId: string; type: string; context: string; count: number }[]> {
        const result = await this.repository.createQueryBuilder('event')
            .select('event.itemId', 'itemId')
            .addSelect('event.type', 'type')
            .addSelect('event.context', 'context')
            .addSelect('COUNT(event.id)', 'count')
            .where('event.timestamp BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('event.type IN (:...types)', { types })
            .andWhere('event.itemId IS NOT NULL')
            .groupBy('event.itemId')
            .addGroupBy('event.type')
            .addGroupBy('event.context')
            .getRawMany();

        return result.map(row => ({
            itemId: row.itemId,
            type: row.type,
            context: row.context,
            count: Number(row.count)
        }));
    }
}
