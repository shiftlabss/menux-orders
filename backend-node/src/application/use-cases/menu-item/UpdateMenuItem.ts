import { IMenuItemRepository } from '@domain/repositories/IMenuItemRepository';
import { MenuItem } from '@domain/entities/MenuItem';
import { AppError } from '@shared/errors';

interface IRequest {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
    isActive?: boolean;
    imageUrl?: string;
    allergens?: string;
    code?: string;
    ingredients?: string;
    tags?: string[];
    menuId?: string;
}

export class UpdateMenuItem {
    constructor(private menuItemRepository: IMenuItemRepository) { }

    async execute(data: IRequest): Promise<MenuItem> {
        const item = await this.menuItemRepository.findById(data.id);

        if (!item) {
            throw new AppError('Menu item not found', 404);
        }

        Object.assign(item, data);

        return this.menuItemRepository.save(item);
    }
}
