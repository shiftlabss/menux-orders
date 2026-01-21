
import { IUpsellRulesRepository } from '../../domain/repositories/IUpsellRulesRepository';
import { UpsellRule } from '../../domain/entities/UpsellRule';

interface UpdateUpsellRuleDTO {
    id: string;
    name?: string;
    upsellType?: string;
    triggerProductId?: string;
    upgradeProductId?: string;
    isActive?: boolean;
}

export class UpdateUpsellRuleUseCase {
    constructor(private upsellRulesRepository: IUpsellRulesRepository) { }

    async execute(dto: UpdateUpsellRuleDTO): Promise<UpsellRule> {
        const rule = await this.upsellRulesRepository.findById(dto.id);

        if (!rule) {
            throw new Error('Upsell rule not found');
        }

        if (dto.triggerProductId && dto.upgradeProductId && dto.triggerProductId === dto.upgradeProductId) {
            throw new Error('Trigger and Upgrade products must be different');
        }

        // Validate if updating only one product id, it doesn't match the other existing one
        const triggerId = dto.triggerProductId || rule.triggerProductId;
        const upgradeId = dto.upgradeProductId || rule.upgradeProductId;

        if (triggerId === upgradeId) {
            throw new Error('Trigger and Upgrade products must be different');
        }

        return this.upsellRulesRepository.update(dto.id, {
            name: dto.name,
            upsellType: dto.upsellType,
            triggerProductId: dto.triggerProductId,
            upgradeProductId: dto.upgradeProductId,
            isActive: dto.isActive,
        });
    }
}
