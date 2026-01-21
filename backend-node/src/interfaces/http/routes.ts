import { Router } from 'express';
import { MenuController } from './controllers/MenuController';
import { SessionController } from './controllers/SessionController';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { waitersRouter } from './routes/waiters.routes';
import { ordersRouter } from './routes/orders.routes';
import { tablesRouter } from './routes/tables.routes';
import { restaurantsRouter } from './routes/restaurants.routes';
import { categoriesRouter } from './routes/categories.routes';
import { customersRouter } from './routes/customers.routes';
import { menuItemsRouter } from './routes/menu-items.routes';
import { menusRouter } from './routes/menus.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { ensureAuthenticated } from './middlewares/ensureAuthenticated';

// Composition Root / Dependency Injection (Manual)
import { TypeOrmMenuRepository } from '@infrastructure/repositories/TypeOrmMenuRepository';
import { TypeOrmSessionRepository } from '@infrastructure/repositories/TypeOrmSessionRepository';
import { RedisCacheAdapter } from '@infrastructure/cache/redis/RedisCacheAdapter';
import { RabbitMqEventBus } from '@infrastructure/queue/rabbitmq/RabbitMqEventBus';

import { GetMenuByRestaurantUseCase } from '@application/use-cases/GetMenuByRestaurant';
import { ListCategoriesByRestaurantUseCase } from '@application/use-cases/ListCategoriesByRestaurant';
import { GetMenuItemDetailsUseCase } from '@application/use-cases/GetMenuItemDetails';
import { StartSessionUseCase } from '@application/use-cases/StartSession';
import { EndSessionUseCase } from '@application/use-cases/EndSession';

const router = Router();

// Infrastructure
const menuRepo = new TypeOrmMenuRepository();
const sessionRepo = new TypeOrmSessionRepository();
const cache = new RedisCacheAdapter();
const eventBus = new RabbitMqEventBus();

// Use Cases
const getMenuUC = new GetMenuByRestaurantUseCase(menuRepo, cache, eventBus);
const listCategoriesUC = new ListCategoriesByRestaurantUseCase(menuRepo, cache);
const getItemUC = new GetMenuItemDetailsUseCase(menuRepo);
const startSessionUC = new StartSessionUseCase(sessionRepo, eventBus);
const endSessionUC = new EndSessionUseCase(sessionRepo, eventBus);

// Controllers
const menuController = new MenuController(getMenuUC, listCategoriesUC, getItemUC, cache);
const sessionController = new SessionController(startSessionUC, endSessionUC);

// Routes - Menu

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Menu management
 */

/**
 * @swagger
 * /restaurants/{restaurantId}/menu:
 *   get:
 *     summary: Get menu by restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Menu details
 */
router.get('/menu/full', ensureAuthenticated, (req, res, next) =>
  menuController.getFullMenu(req, res, next),
);

/**
 * @swagger
 * /menu/highlights:
 *   get:
 *     summary: Get highlight menu items (Internal)
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional restaurant ID override
 *     responses:
 *       200:
 *         description: List of highlighted items
 */
router.get('/menu/highlights', ensureAuthenticated, (req, res, next) =>
  menuController.getHighlights(req, res, next),
);

/**
 * @swagger
 * /menu/highlightsPublic:
 *   get:
 *     summary: Get highlight menu items (Public)
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of highlighted items
 */
router.get('/menu/highlightsPublic', (req, res, next) =>
  menuController.getHighlights(req, res, next),
);

/**
 * @swagger
 * /menu/highlights:
 *   post:
 *     summary: Update highlight suggestions
 *     tags: [Menu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - products
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: List of product objects to highlight
 *     responses:
 *       200:
 *         description: Highlights updated successfully
 */
router.post('/menu/highlights', ensureAuthenticated, (req, res, next) =>
  menuController.updateHighlights(req, res, next),
);

router.get('/restaurants/:restaurantId/menu', (req, res, next) =>
  menuController.getMenu(req, res, next),
);

/**
 * @swagger
 * /restaurants/{restaurantId}/categories:
 *   get:
 *     summary: List categories by restaurant
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/restaurants/:restaurantId/categories', (req, res, next) =>
  menuController.listCategories(req, res, next),
);

/**
 * @swagger
 * /menu-items/{id}:
 *   get:
 *     summary: Get menu item details
 *     tags: [Menu]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Menu item details
 *       404:
 *         description: Item not found
 */
router.get('/menu-items/:id', (req, res, next) => menuController.getItem(req, res, next));

// Routes - Session

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Session management
 */

/**
 * @swagger
 * /sessions/start:
 *   post:
 *     summary: Start a new session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *             properties:
 *               tableId:
 *                 type: string
 *               customerName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session started
 */
router.post('/sessions/start', (req, res, next) => sessionController.start(req, res, next));

/**
 * @swagger
 * /sessions/end:
 *   post:
 *     summary: End a session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session ended
 */
router.post('/sessions/end', (req, res, next) => sessionController.end(req, res, next));

import { upsellRulesRouter } from './routes/upsell-rules.routes';

// Routes - Backoffice
router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/waiters', waitersRouter);
router.use('/orders', ordersRouter);
router.use('/tables', tablesRouter);
router.use('/restaurants', restaurantsRouter);
router.use('/categories', categoriesRouter);
router.use('/menu-items', menuItemsRouter);
router.use('/menus', menusRouter);
router.use('/customers', customersRouter);
router.use('/upsell-rules', upsellRulesRouter);
router.use('/analytics', analyticsRouter);

export { router };
