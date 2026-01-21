import { Repository, Brackets } from 'typeorm';
import { IMenuItemRepository } from '@domain/repositories/IMenuItemRepository';
import { MenuItem } from '@domain/entities/MenuItem';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmMenuItemRepository implements IMenuItemRepository {
    private repository: Repository<MenuItem>;

    constructor() {
        this.repository = AppDataSource.getRepository(MenuItem);
    }

    async create(item: MenuItem): Promise<MenuItem> {
        const created = this.repository.create(item);
        return this.repository.save(created);
    }

    async save(item: MenuItem): Promise<MenuItem> {
        return this.repository.save(item);
    }

    async findById(id: string): Promise<MenuItem | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['category']
        });
    }

    async findByCategoryId(categoryId: string): Promise<MenuItem[]> {
        return this.repository.find({
            where: { categoryId }
        });
    }

    async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
        // Since MenuItem doesn't have restaurantId directly (it's in Category)
        return this.repository.find({
            where: { category: { restaurantId } },
            relations: ['category']
        });
    }

    async findByTags(tags: string[], restaurantId: string): Promise<MenuItem[]> {
        const query = this.repository.createQueryBuilder('item')
            .leftJoinAndSelect('item.category', 'category')
            .where('category.restaurantId = :restaurantId', { restaurantId })
            .andWhere('item.isActive = :isActive', { isActive: true });

        if (tags.length > 0) {
            query.andWhere(new Brackets(qb => {
                tags.forEach((tag, index) => {
                    qb.orWhere(`item.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
                });
            }));
        }

        return query.getMany();
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
