import { Category } from '@domain/entities/Category';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';

interface IRequest {
    name: string;
    order?: number;
    isActive?: boolean;
    restaurantId: string;
    pai?: string;
}

export class CreateCategory {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute({ name, order, isActive, restaurantId, pai }: IRequest): Promise<Category> {
        const category = new Category();
        category.name = name;
        category.order = order || 0;
        category.isActive = isActive !== undefined ? isActive : true;
        category.restaurantId = restaurantId;
        category.pai = pai || null;

        return this.categoryRepository.create(category);
    }
}
