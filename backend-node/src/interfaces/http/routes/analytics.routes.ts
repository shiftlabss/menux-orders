import { Router } from 'express';
import { DailyMetricsController } from '../controllers/DailyMetricsController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { GetRestaurantDailyMetrics } from '@application/use-cases/analytics/GetRestaurantDailyMetrics';
import { UpdateRestaurantDailyMetrics } from '@application/use-cases/analytics/UpdateRestaurantDailyMetrics';
import { TypeOrmDailyMetricRepository } from '@infrastructure/repositories/TypeOrmDailyMetricRepository';
import { TypeOrmOrderRepository } from '@infrastructure/repositories/TypeOrmOrderRepository';
import { RedisCacheAdapter } from '@infrastructure/cache/redis/RedisCacheAdapter';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

// ... (previous code)

import { GetTopProducts } from '@application/use-cases/analytics/GetTopProducts';
import { TypeOrmMenuItemRepository } from '@infrastructure/repositories/TypeOrmMenuItemRepository';
import { TypeOrmAnalyticsRepository } from '@infrastructure/repositories/TypeOrmAnalyticsRepository';

const analyticsRouter = Router();

const dailyMetricRepository = new TypeOrmDailyMetricRepository();
const orderRepository = new TypeOrmOrderRepository();
const analyticsRepository = new TypeOrmAnalyticsRepository();
const menuItemRepository = new TypeOrmMenuItemRepository();
const cacheAdapter = new RedisCacheAdapter();

const updateRestaurantDailyMetrics = new UpdateRestaurantDailyMetrics(dailyMetricRepository, orderRepository, cacheAdapter);
const getRestaurantDailyMetrics = new GetRestaurantDailyMetrics(updateRestaurantDailyMetrics, cacheAdapter);

const getTopProducts = new GetTopProducts(orderRepository, analyticsRepository, menuItemRepository);

const dailyMetricsController = new DailyMetricsController(getRestaurantDailyMetrics, updateRestaurantDailyMetrics);
const analyticsController = new AnalyticsController(getTopProducts);

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and Dashboard Data
 */

/**
 * @swagger
 * /analytics/top-products:
 *   get:
 *     summary: Get top products by revenue and conversion
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *       - in: query
 *         name: period
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Hoje, Ontem, "7 dias", "30 dias"]
 *           default: Hoje
 *     responses:
 *       200:
 *         description: List of top products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   category:
 *                     type: string
 *                   revenue:
 *                     type: object
 *                   conversion:
 *                     type: object
 */
analyticsRouter.get('/top-products', ensureAuthenticated, (req, res, next) => analyticsController.getTopProducts(req, res, next));

/**


/**
 * @swagger
 * /analytics/daily:
 *   get:
 *     summary: Get today's metrics for the restaurant
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID (optional if authenticated)
 *     responses:
 *       200:
 *         description: Daily metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 averageTicket:
 *                   type: number
 *                 averageDecisionTime:
 *                   type: number
 *                 date:
 *                   type: string
 *                   format: date
 */
analyticsRouter.get('/daily', ensureAuthenticated, (req, res, next) => dailyMetricsController.show(req, res, next));

/**
 * @swagger
 * /analytics/daily/recalculate:
 *   post:
 *     summary: Force recalculation of daily metrics for a specific date
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *                 description: Restaurant ID (optional if authenticated)
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2023-10-27"
 *     responses:
 *       200:
 *         description: Recalculated metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *                 averageTicket:
 *                   type: number
 *                 averageDecisionTime:
 *                   type: number
 */


analyticsRouter.post('/daily/recalculate', ensureAuthenticated, (req, res, next) => dailyMetricsController.recalculate(req, res, next));

/**
 * @swagger
 * /analytics/events:
 *   post:
 *     summary: Send analytics events (impressions, clicks, views, etc.)
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - events
 *             properties:
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       enum: [impression, click, view, item_rejected, cart_update]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     sessionId:
 *                       type: string
 *                     itemId:
 *                       type: string
 *                     context:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: string
 *                     itemCount:
 *                       type: integer
 *                     totalValue:
 *                       type: number
 *     responses:
 *       202:
 *         description: Events accepted for processing
 */
analyticsRouter.post('/events', (req, res, next) => analyticsController.handle(req, res, next));

export { analyticsRouter };
