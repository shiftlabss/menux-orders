import { Category } from '@domain/entities/Category';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { AppError } from '@shared/errors';

interface IRequest {
    id: string;
    name?: string;
    order?: number;
    isActive?: boolean;
    pai?: string;
}

export class UpdateCategory {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute({ id, name, order, isActive, pai }: IRequest): Promise<Category> {
        const category = await this.categoryRepository.findById(id);

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        if (name) category.name = name;
        if (order !== undefined) category.order = order;
        if (isActive !== undefined) category.isActive = isActive;
        if (pai !== undefined) category.pai = pai || null;

        return this.categoryRepository.save(category);
    }
}
