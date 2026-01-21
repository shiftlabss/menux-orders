
import { UpsellRule } from '../entities/UpsellRule';

export interface IUpsellRulesRepository {
    create(rule: Partial<UpsellRule>): Promise<UpsellRule>;
    findAll(restaurantId?: string): Promise<UpsellRule[]>;
    findById(id: string): Promise<UpsellRule | null>;
    update(id: string, rule: Partial<UpsellRule>): Promise<UpsellRule>;
    delete(id: string): Promise<void>;
    findByTriggerProduct(triggerId: string, restaurantId?: string, upsellType?: string): Promise<UpsellRule[]>;
}
