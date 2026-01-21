import { IMenuItemRepository } from '@domain/repositories/IMenuItemRepository';
import { MenuItem } from '@domain/entities/MenuItem';

export class FilterMenuItemsByTags {
    constructor(
        private menuItemRepository: IMenuItemRepository
    ) { }

    async execute(tags: string[], restaurantId: string): Promise<MenuItem[]> {
        return this.menuItemRepository.findByTags(tags, restaurantId);
    }
}
