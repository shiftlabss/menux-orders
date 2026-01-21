import { Router } from 'express';
import { TablesController } from '../controllers/TablesController';
import { CreateTable } from '@application/use-cases/table/CreateTable';
import { UpdateTable } from '@application/use-cases/table/UpdateTable';
import { DeleteTable } from '@application/use-cases/table/DeleteTable';
import { ListTablesWithSummary } from '@application/use-cases/table/ListTablesWithSummary';
import { ListTablesByWaiter } from '@application/use-cases/table/ListTablesByWaiter';
import { TypeOrmTableRepository } from '@infrastructure/repositories/TypeOrmTableRepository';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const tablesRouter = Router();

// Dependencies
const tableRepository = new TypeOrmTableRepository();
const createTable = new CreateTable(tableRepository);
const updateTable = new UpdateTable(tableRepository);
const deleteTable = new DeleteTable(tableRepository);
const listTables = new ListTablesWithSummary(tableRepository);
const listTablesByWaiter = new ListTablesByWaiter(tableRepository);

const tablesController = new TablesController(
    createTable,
    updateTable,
    deleteTable,
    listTables,
    listTablesByWaiter
);

tablesRouter.use(ensureAuthenticated);

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Table management
 */

/**
 * @swagger
 * /tables:
 *   get:
 *     summary: List tables by restaurant
 *     tags: [Tables]
 *     parameters:
 *       - in: query
 *         name: waiterId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter tables by assigned waiter ID
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [FREE, OCCUPIED, CLOSING, CLOSED]
 *         description: Filter tables by status
 *       - in: query
 *         name: priority
 *         required: false
 *         schema:
 *           type: string
 *           enum: [MEDIUM, HIGH]
 *         description: Filter tables by priority
 *     responses:
 *       200:
 *         description: List of tables
 *   post:
 *     summary: Create a new table
 *     tags: [Tables]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *             properties:
 *               number:
 *                 type: integer
 *               capacity:
 *                 type: integer
 */
tablesRouter.get('/', (req, res, next) => tablesController.index(req, res, next));
tablesRouter.post('/', (req, res, next) => tablesController.create(req, res, next));

/**
 * @swagger
 * /tables/{id}:
 *   put:
 *     summary: Update a table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Table updated
 *   delete:
 *     summary: Delete a table
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Table deleted
 */
tablesRouter.put('/:id', (req, res, next) => tablesController.update(req, res, next));
tablesRouter.delete('/:id', (req, res, next) => tablesController.delete(req, res, next));

export { tablesRouter };
