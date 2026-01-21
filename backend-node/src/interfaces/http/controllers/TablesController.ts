import { Request, Response, NextFunction } from 'express';
import { CreateTable } from '@application/use-cases/table/CreateTable';
import { UpdateTable } from '@application/use-cases/table/UpdateTable';
import { DeleteTable } from '@application/use-cases/table/DeleteTable';
import { ListTablesWithSummary } from '@application/use-cases/table/ListTablesWithSummary';
import { ListTablesByWaiter } from '@application/use-cases/table/ListTablesByWaiter';

export class TablesController {
    constructor(
        private createTable: CreateTable,
        private updateTable: UpdateTable,
        private deleteTable: DeleteTable,
        private listTables: ListTablesWithSummary,
        private listTablesByWaiter: ListTablesByWaiter
    ) { }

    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { waiterId } = req.query;
            const restaurantId = (req.query.restaurantId || req.user?.restaurantId) as string;

            if (!restaurantId) {
                res.status(400).json({ message: 'Restaurant ID is required' });
                return;
            }

            let tables;

            if (waiterId) {
                tables = await this.listTablesByWaiter.execute(restaurantId, waiterId as string);
            } else {
                tables = await this.listTables.execute(restaurantId);
            }

            res.json(tables);
        } catch (error) {
            next(error);
        }
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const restaurantId = req.user.restaurantId;
            const { number, capacity } = req.body;

            const table = await this.createTable.execute({
                number,
                capacity,
                restaurantId
            });

            res.status(201).json(table);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const restaurantId = req.user.restaurantId;
            const data = req.body;

            const table = await this.updateTable.execute({
                ...data,
                id,
                restaurantId
            });

            res.json(table);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const restaurantId = req.user.restaurantId;

            await this.deleteTable.execute(id, restaurantId);

            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
