import { Router } from 'express';
import { MenuItemsController } from '../controllers/MenuItemsController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const menuItemsRouter = Router();
const menuItemsController = new MenuItemsController();

/**
 * @swagger
 * tags:
 *   name: MenuItems
 *   description: Menu item management
 */

/**
 * @swagger
 * /menu-items:
 *   get:
 *     summary: List menu items
 *     tags: [MenuItems]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of items
 */
menuItemsRouter.get('/', ensureAuthenticated, menuItemsController.index);

/**
 * @swagger
 * /menu-items/{id}:
 *   get:
 *     summary: Get menu item details
 *     tags: [MenuItems]
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
 *         description: Item details
 */
menuItemsRouter.get('/:id', ensureAuthenticated, menuItemsController.show);

/**
 * @swagger
 * /menu-items:
 *   post:
 *     summary: Create new menu item
 *     tags: [MenuItems]
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
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *               allergens:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               menuId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Item created
 */
menuItemsRouter.post('/', ensureAuthenticated, menuItemsController.create);

/**
 * @swagger
 * /menu-items/{id}:
 *   put:
 *     summary: Update menu item
 *     tags: [MenuItems]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               isActive:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *               allergens:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               menuId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Item updated
 */
menuItemsRouter.put('/:id', ensureAuthenticated, menuItemsController.update);

/**
 * @swagger
 * /menu-items/{id}:
 *   delete:
 *     summary: Delete menu item
 *     tags: [MenuItems]
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
 *         description: Item deleted
 */
menuItemsRouter.delete('/:id', ensureAuthenticated, menuItemsController.delete);

/**
 * @swagger
 * /menu-items/search/tags:
 *   get:
 *     summary: Search menu items by tags
 *     tags: [MenuItems]
 *     parameters:
 *       - in: query
 *         name: tags
 *         schema:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *         description: Tags to search for (comma separated or multiple params)
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID (Optional if authenticated)
 *     responses:
 *       200:
 *         description: List of items matching tags
 */
menuItemsRouter.get('/search/tags', menuItemsController.filterByTags);

export { menuItemsRouter };
