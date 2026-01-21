import { Restaurant } from '../entities/Restaurant';

export interface IRestaurantRepository {
    create(restaurant: Restaurant): Promise<Restaurant>;
    findById(id: string): Promise<Restaurant | null>;
    findBySlug(slug: string): Promise<Restaurant | null>;
    save(restaurant: Restaurant): Promise<Restaurant>;
}
