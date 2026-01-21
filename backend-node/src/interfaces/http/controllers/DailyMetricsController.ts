import { Request, Response, NextFunction } from 'express';
import { GetRestaurantDailyMetrics } from '@application/use-cases/analytics/GetRestaurantDailyMetrics';
import { UpdateRestaurantDailyMetrics } from '@application/use-cases/analytics/UpdateRestaurantDailyMetrics';

export class DailyMetricsController {
    constructor(
        private getRestaurantDailyMetrics: GetRestaurantDailyMetrics,
        private updateRestaurantDailyMetrics: UpdateRestaurantDailyMetrics
    ) { }

    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req as any).user?.restaurantId || req.query.restaurantId;

            if (!restaurantId) {
                res.status(400).json({ message: 'Restaurant ID is required' });
                return;
            }

            const metrics = await this.getRestaurantDailyMetrics.execute(restaurantId);

            res.json(metrics);
        } catch (error) {
            next(error);
        }
    }

    async recalculate(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req as any).user?.restaurantId || req.query.restaurantId;
            const { date } = req.body;

            if (!restaurantId || !date) {
                res.status(400).json({ message: 'Restaurant ID and date (YYYY-MM-DD) are required' });
                return;
            }

            // Parse date string (YYYY-MM-DD) to Date object (local time consideration might be needed, 
            // but UpdateRestaurantDailyMetrics expects Date)
            // Assuming simple ISO date part
            const dateObj = new Date(date + 'T00:00:00');

            const metrics = await this.updateRestaurantDailyMetrics.execute(restaurantId, dateObj);

            res.json(metrics);
        } catch (error) {
            next(error);
        }
    }
}
