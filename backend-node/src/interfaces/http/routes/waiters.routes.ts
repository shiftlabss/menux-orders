import { Router } from 'express';
import { WaitersController } from '../controllers/WaitersController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const waitersRouter = Router();
const waitersController = new WaitersController();

/**
 * @swagger
 * tags:
 *   name: Waiters
 *   description: Waiter management
 */

/**
 * @swagger
 * /waiters:
 *   post:
 *     summary: Create a new waiter
 *     tags: [Waiters]
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
 *               - pinCode
 *             properties:
 *               name:
 *                 type: string
 *               nickname:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               pinCode:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Waiter created
 */
waitersRouter.post('/', ensureAuthenticated, waitersController.create);

/**
 * @swagger
 * /waiters:
 *   get:
 *     summary: List all waiters of the current restaurant
 *     tags: [Waiters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of waiters
 */
waitersRouter.get('/', ensureAuthenticated, waitersController.index);

/**
 * @swagger
 * /waiters/{id}:
 *   get:
 *     summary: Get waiter by ID
 *     tags: [Waiters]
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
 *       200:
 *         description: Waiter details
 */
waitersRouter.get('/:id', ensureAuthenticated, waitersController.show);

/**
 * @swagger
 * /waiters/{id}:
 *   put:
 *     summary: Update waiter
 *     tags: [Waiters]
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
 *               nickname:
 *                 type: string
 *               avatarUrl:
 *                 type: string
 *               pinCode:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Waiter updated
 */
waitersRouter.put('/:id', ensureAuthenticated, waitersController.update);

/**
 * @swagger
 * /waiters/{id}:
 *   delete:
 *     summary: Delete waiter
 *     tags: [Waiters]
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
 *         description: Waiter deleted
 */
waitersRouter.delete('/:id', ensureAuthenticated, waitersController.delete);

export { waitersRouter };
