import { Router } from 'express';
import { MenusController } from '../controllers/MenusController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const menusRouter = Router();
const controller = new MenusController();

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu entities management
 */

/**
 * @swagger
 * /menus:
 *   post:
 *     summary: Create a new menu
 *     tags: [Menus]
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Menu created
 */
menusRouter.post('/', ensureAuthenticated, controller.create);

export { menusRouter };
