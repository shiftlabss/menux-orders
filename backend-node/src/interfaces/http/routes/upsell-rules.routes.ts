
import { Router } from 'express';
import { UpsellRulesController } from '../controllers/UpsellRulesController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const upsellRulesRouter = Router();
const controller = new UpsellRulesController();

// upsellRulesRouter.use(ensureAuthenticated);

/**
 * @swagger
 * tags:
 *   name: UpsellRules
 *   description: Upsell rules management
 */

/**
 * @swagger
 * /upsell-rules:
 *   get:
 *     summary: List all upsell rules
 *     tags: [UpsellRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: triggerProductId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by trigger product ID
 *       - in: query
 *         name: upsellType
 *         schema:
 *           type: string
 *           enum: [upsell, cross-sell]
 *         description: Filter by rule type
 *     responses:
 *       200:
 *         description: List of upsell rules
 */
upsellRulesRouter.get('/', (req, res, next) => controller.index(req, res, next));

/**
 * @swagger
 * /upsell-rules:
 *   post:
 *     summary: Create a new upsell rule
 *     tags: [UpsellRules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - triggerProductId
 *               - upgradeProductId
 *             properties:
 *               name:
 *                 type: string
 *               upsellType:
 *                 type: string
 *                 enum: [upsell, cross-sell]
 *                 default: upsell
 *               triggerProductId:
 *                 type: string
 *                 format: uuid
 *               upgradeProductId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Upsell rule created
 */
upsellRulesRouter.post('/', ensureAuthenticated, (req, res, next) => controller.create(req, res, next));

/**
 * @swagger
 * /upsell-rules/{id}:
 *   put:
 *     summary: Update an upsell rule
 *     tags: [UpsellRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               upsellType:
 *                 type: string
 *                 enum: [upsell, cross-sell]
 *               triggerProductId:
 *                 type: string
 *                 format: uuid
 *               upgradeProductId:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Upsell rule updated
 */
upsellRulesRouter.put('/:id', ensureAuthenticated, (req, res, next) => controller.update(req, res, next));

/**
 * @swagger
 * /upsell-rules/{id}:
 *   delete:
 *     summary: Delete an upsell rule
 *     tags: [UpsellRules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Rule deleted
 */
upsellRulesRouter.delete('/:id', ensureAuthenticated, (req, res, next) => controller.delete(req, res, next));

export { upsellRulesRouter };
