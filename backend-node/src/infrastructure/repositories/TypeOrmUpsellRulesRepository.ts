
import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';
import { UpsellRule } from '../../domain/entities/UpsellRule';
import { IUpsellRulesRepository } from '../../domain/repositories/IUpsellRulesRepository';

export class TypeOrmUpsellRulesRepository implements IUpsellRulesRepository {
    private repository: Repository<UpsellRule>;

    constructor() {
        this.repository = AppDataSource.getRepository(UpsellRule);
    }

    async create(rule: Partial<UpsellRule>): Promise<UpsellRule> {
        const newRule = this.repository.create(rule);
        return this.repository.save(newRule);
    }

    async findAll(restaurantId?: string): Promise<UpsellRule[]> {
        const where: any = {};
        if (restaurantId) where.restaurantId = restaurantId;

        return this.repository.find({
            where,
            relations: ['triggerProduct', 'upgradeProduct'],
            order: { createdAt: 'DESC' },
        });
    }

    async findById(id: string): Promise<UpsellRule | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['triggerProduct', 'upgradeProduct'],
        });
    }

    async update(id: string, rule: Partial<UpsellRule>): Promise<UpsellRule> {
        await this.repository.update(id, rule);
        return this.repository.findOneOrFail({
            where: { id },
            relations: ['triggerProduct', 'upgradeProduct'],
        });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async findByTriggerProduct(triggerId: string, restaurantId?: string, upsellType?: string): Promise<UpsellRule[]> {
        const where: any = { triggerProductId: triggerId, isActive: true };
        if (restaurantId) where.restaurantId = restaurantId;
        if (upsellType) {
            where.upsellType = upsellType;
        }

        return this.repository.find({
            where,
            relations: ['upgradeProduct'],
        });
    }
}
