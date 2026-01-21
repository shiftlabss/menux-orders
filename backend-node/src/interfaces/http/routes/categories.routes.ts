import { Router } from 'express';
import { CategoriesController } from '../controllers/CategoriesController';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const categoriesRouter = Router();
const categoriesController = new CategoriesController();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
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
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               pai:
 *                 type: string
 *                 format: uuid
 *               restaurantId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoryResponse'
 */
categoriesRouter.post('/', ensureAuthenticated, categoriesController.create);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CategoryResponse'
 */
categoriesRouter.get('/', ensureAuthenticated, categoriesController.index);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
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
 *         description: Category found
 *       404:
 *         description: Category not found
 */
categoriesRouter.get('/:id', ensureAuthenticated, categoriesController.show);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update category
 *     tags: [Categories]
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
 *               order:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *               pai:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Category updated
 */
categoriesRouter.put('/:id', ensureAuthenticated, categoriesController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     tags: [Categories]
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
 *         description: Category deleted
 *       400:
 *         description: Cannot delete category (e.g. has subcategories)
 */
categoriesRouter.delete('/:id', ensureAuthenticated, categoriesController.delete);

/**
 * @swagger
 * /categories/reorder:
 *   post:
 *     summary: Reorder categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       204:
 *         description: Categories reordered
 */
categoriesRouter.post('/reorder', ensureAuthenticated, categoriesController.reorder);

export { categoriesRouter };
