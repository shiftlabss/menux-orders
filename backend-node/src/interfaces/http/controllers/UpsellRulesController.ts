
import { Request, Response, NextFunction } from 'express';
import { CreateUpsellRuleUseCase } from '../../../application/use-cases/CreateUpsellRule';
import { UpdateUpsellRuleUseCase } from '../../../application/use-cases/UpdateUpsellRule';
import { ListUpsellRulesUseCase } from '../../../application/use-cases/ListUpsellRules';
import { TypeOrmUpsellRulesRepository } from '../../../infrastructure/repositories/TypeOrmUpsellRulesRepository';

export class UpsellRulesController {
    private createUseCase: CreateUpsellRuleUseCase;
    private updateUseCase: UpdateUpsellRuleUseCase;
    private listUseCase: ListUpsellRulesUseCase;
    private repository: TypeOrmUpsellRulesRepository;

    constructor() {
        this.repository = new TypeOrmUpsellRulesRepository();
        this.createUseCase = new CreateUpsellRuleUseCase(this.repository);
        this.updateUseCase = new UpdateUpsellRuleUseCase(this.repository);
        this.listUseCase = new ListUpsellRulesUseCase(this.repository);
    }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, upsellType, triggerProductId, upgradeProductId } = req.body;
            const restaurantId = (req as any).user?.restaurantId;
            const rule = await this.createUseCase.execute({ name, upsellType, triggerProductId, upgradeProductId, restaurantId });
            res.status(201).json(rule);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { name, upsellType, triggerProductId, upgradeProductId, isActive } = req.body;

            const rule = await this.updateUseCase.execute({
                id,
                name,
                upsellType,
                triggerProductId,
                upgradeProductId,
                isActive
            });

            res.json(rule);
        } catch (error) {
            next(error);
        }
    }

    async index(req: Request, res: Response, next: NextFunction): Promise<void> {
        const triggerProductId = req.query.triggerProductId as string;
        const upsellType = req.query.upsellType as string;
        const restaurantId = (req as any).user?.restaurantId;

        try {
            const rules = await this.listUseCase.execute({ triggerProductId, upsellType, restaurantId });
            res.json(rules);
        } catch (error) {
            next(error);
        }
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            await this.repository.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
