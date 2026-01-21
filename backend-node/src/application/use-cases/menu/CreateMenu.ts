import { IMenuRepository } from '@domain/repositories/IMenuRepository';
import { Menu } from '@domain/entities/Menu';

interface IRequest {
    name: string;
    description?: string;
    restaurantId: string;
    isActive?: boolean;
}

export class CreateMenuUseCase {
    constructor(private menuRepository: IMenuRepository) { }

    async execute(data: IRequest): Promise<Menu> {
        const menu = await this.menuRepository.create({
            name: data.name,
            description: data.description,
            restaurantId: data.restaurantId,
            isActive: data.isActive ?? true,
        });
        return menu;
    }
}
