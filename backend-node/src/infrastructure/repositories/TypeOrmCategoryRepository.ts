import { Repository, IsNull } from 'typeorm';
import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';
import { Category } from '@domain/entities/Category';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmCategoryRepository implements ICategoryRepository {
    private repository: Repository<Category>;

    constructor() {
        this.repository = AppDataSource.getRepository(Category);
    }

    async create(category: Category): Promise<Category> {
        const created = this.repository.create(category);
        return this.repository.save(created);
    }

    async save(category: Category): Promise<Category> {
        return this.repository.save(category);
    }

    async findById(id: string): Promise<Category | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['parentCategory', 'subcategories']
        });
    }

    async findByRestaurantId(restaurantId: string, rootOnly = false): Promise<Category[]> {
        const where: any = { restaurantId };
        if (rootOnly) {
            where.pai = IsNull();
        }

        return this.repository.find({
            where,
            relations: ['subcategories'],
            order: { order: 'ASC' }
        });
    }

    async findByParentId(parentId: string): Promise<Category[]> {
        return this.repository.find({
            where: { pai: parentId },
            relations: ['subcategories'],
            order: { order: 'ASC' }
        });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
