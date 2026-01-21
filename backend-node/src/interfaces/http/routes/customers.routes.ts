import { Router } from 'express';
import { CustomersController } from '../controllers/CustomersController';
import { TypeOrmCustomerRepository } from '@infrastructure/repositories/TypeOrmCustomerRepository';
import { ListCustomersByRestaurant } from '@application/use-cases/customer/ListCustomersByRestaurant';
import { GetCustomerDetails } from '@application/use-cases/customer/GetCustomerDetails';
import { ensureAuthenticated } from '../middlewares/ensureAuthenticated';

const customersRouter = Router();

const customerRepository = new TypeOrmCustomerRepository();
const listCustomers = new ListCustomersByRestaurant(customerRepository);
const getCustomerDetails = new GetCustomerDetails(customerRepository);

const customersController = new CustomersController(
    listCustomers,
    getCustomerDetails
);

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: List all customers by restaurant
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         schema:
 *           type: string
 *         description: Restaurant ID (if not provided, uses authenticated user's restaurant)
 *     responses:
 *       200:
 *         description: A list of customers
 */
customersRouter.get('/', ensureAuthenticated, (req, res, next) => customersController.index(req, res, next));

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer details
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details with order history
 */
customersRouter.get('/:id', ensureAuthenticated, (req, res, next) => customersController.show(req, res, next));

export { customersRouter };
