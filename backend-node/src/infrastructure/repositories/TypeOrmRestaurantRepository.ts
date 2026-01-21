import { IRestaurantRepository } from '@domain/repositories/IRestaurantRepository';
import { Restaurant } from '@domain/entities/Restaurant';
import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmRestaurantRepository implements IRestaurantRepository {
    private repository: Repository<Restaurant>;

    constructor() {
        this.repository = AppDataSource.getRepository(Restaurant);
    }

    async create(restaurant: Restaurant): Promise<Restaurant> {
        return this.repository.save(restaurant);
    }

    async findById(id: string): Promise<Restaurant | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findBySlug(slug: string): Promise<Restaurant | null> {
        return this.repository.findOne({ where: { slug } });
    }

    async save(restaurant: Restaurant): Promise<Restaurant> {
        return this.repository.save(restaurant);
    }
}
