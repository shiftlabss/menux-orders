import { Request, Response, NextFunction } from 'express';
import { rabbitInstance } from '@infrastructure/queue';

import { GetTopProducts } from '@application/use-cases/analytics/GetTopProducts';

export class AnalyticsController {
    constructor(
        private getTopProductsUseCase: GetTopProducts
    ) { }

    async handle(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { events } = req.body;

            if (!events || !Array.isArray(events)) {
                return res.status(400).json({ error: 'Invalid payload. "events" array is required.' });
            }

            // Publish to RabbitMQ
            await rabbitInstance.publishInQueue('analytics_events', JSON.stringify(events));

            // Return Accepted
            return res.status(202).send();
        } catch (error) {
            next(error);
        }
    }

    async getTopProducts(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { restaurantId } = req.query; // If using middleware, user might have restaurantId
            const { period } = req.query;

            // Fallback for restaurantId if not in query (e.g. from auth token if implemented, but here using query for simplicity matching other routes)
            // Or maybe hardcoded for MVP? "ensureAuthenticated" puts user in req.user?
            // Let's assume passed in query or we use a default.

            if (!restaurantId && !req.user?.restaurantId) {
                return res.status(400).json({ error: 'Restaurant ID is required' });
            }

            const targetRestaurantId = (restaurantId as string) || req.user?.restaurantId;

            const result = await this.getTopProductsUseCase.execute(targetRestaurantId, period as string || 'Hoje');

            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}
