
import { IUpsellRulesRepository } from '../../domain/repositories/IUpsellRulesRepository';
import { UpsellRule } from '../../domain/entities/UpsellRule';

interface CreateUpsellRuleDTO {
    name: string;
    upsellType?: string;
    triggerProductId: string;
    upgradeProductId: string;
    restaurantId: string;
}

export class CreateUpsellRuleUseCase {
    constructor(private upsellRulesRepository: IUpsellRulesRepository) { }

    async execute(dto: CreateUpsellRuleDTO): Promise<UpsellRule> {
        if (!dto.triggerProductId || !dto.upgradeProductId) {
            throw new Error('Trigger and Upgrade products are required');
        }

        if (dto.triggerProductId === dto.upgradeProductId) {
            throw new Error('Trigger and Upgrade products must be different');
        }

        return this.upsellRulesRepository.create({
            name: dto.name,
            upsellType: dto.upsellType || 'upsell',
            triggerProductId: dto.triggerProductId,
            upgradeProductId: dto.upgradeProductId,
            restaurantId: dto.restaurantId,
            isActive: true,
        });
    }
}
