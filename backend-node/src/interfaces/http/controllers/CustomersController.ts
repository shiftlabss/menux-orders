import { Request, Response, NextFunction } from 'express';
import { ListCustomersByRestaurant } from '@application/use-cases/customer/ListCustomersByRestaurant';
import { GetCustomerDetails } from '@application/use-cases/customer/GetCustomerDetails';

export class CustomersController {
    constructor(
        private listCustomers: ListCustomersByRestaurant,
        private getCustomerDetails: GetCustomerDetails
    ) { }

    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = (req.query.restaurantId || req.user?.restaurantId) as string;

            if (!restaurantId) {
                res.status(400).json({ message: 'Restaurant ID is required' });
                return;
            }

            const customers = await this.listCustomers.execute(restaurantId);

            res.json(customers);
        } catch (error) {
            next(error);
        }
    }

    async show(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const customer = await this.getCustomerDetails.execute(id);

            res.json(customer);
        } catch (error) {
            next(error);
        }
    }
}
