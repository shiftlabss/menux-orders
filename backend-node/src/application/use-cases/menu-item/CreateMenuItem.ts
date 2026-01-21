import { IMenuItemRepository } from '@domain/repositories/IMenuItemRepository';
import { MenuItem } from '@domain/entities/MenuItem';

interface IRequest {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    isActive?: boolean;
    imageUrl?: string;
    allergens?: string;
    code?: string;
    ingredients?: string;
    tags?: string[];
    menuId: string;
}

export class CreateMenuItem {
    constructor(private menuItemRepository: IMenuItemRepository) { }

    async execute(data: IRequest): Promise<MenuItem> {
        const item = new MenuItem();
        Object.assign(item, {
            ...data,
            isActive: data.isActive ?? true,
        });

        return this.menuItemRepository.create(item);
    }
}
