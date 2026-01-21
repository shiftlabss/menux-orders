import { Request, Response, NextFunction } from 'express';
import { CreateMenuUseCase } from '../../../application/use-cases/menu/CreateMenu';
import { TypeOrmMenuRepository } from '../../../infrastructure/repositories/TypeOrmMenuRepository';

export class MenusController {
    private createMenuUseCase: CreateMenuUseCase;

    constructor() {
        const repo = new TypeOrmMenuRepository();
        this.createMenuUseCase = new CreateMenuUseCase(repo);
    }

    public create = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        try {
            const { name, description, isActive } = req.body;
            const restaurantId = req.user?.restaurantId || req.body.restaurantId;

            if (!restaurantId) {
                return res.status(400).json({ message: 'Restaurant ID is required' });
            }

            const menu = await this.createMenuUseCase.execute({
                name,
                description,
                restaurantId,
                isActive
            });

            return res.status(201).json(menu);
        } catch (error) {
            next(error);
        }
    }
}
