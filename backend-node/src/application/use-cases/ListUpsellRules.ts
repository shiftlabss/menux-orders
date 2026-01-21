
import { IUpsellRulesRepository } from '../../domain/repositories/IUpsellRulesRepository';
import { UpsellRule } from '../../domain/entities/UpsellRule';

export class ListUpsellRulesUseCase {
    constructor(private upsellRulesRepository: IUpsellRulesRepository) { }

    async execute(filters: { triggerProductId?: string; upsellType?: string; restaurantId?: string } = {}): Promise<UpsellRule[]> {
        if (filters.triggerProductId) {
            return this.upsellRulesRepository.findByTriggerProduct(filters.triggerProductId, filters.restaurantId, filters.upsellType);
        }
        return this.upsellRulesRepository.findAll(filters.restaurantId);
    }
}
