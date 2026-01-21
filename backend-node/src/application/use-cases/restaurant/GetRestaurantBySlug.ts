import { IRestaurantRepository } from '@domain/repositories/IRestaurantRepository';
import { Restaurant } from '@domain/entities/Restaurant';
import { AppError } from '../../../shared/errors';
import { ICachePort } from '@application/ports/ICachePort';

export class GetRestaurantBySlug {
    constructor(
        private restaurantRepository: IRestaurantRepository,
        private cachePort: ICachePort
    ) { }

    async execute(slug: string): Promise<Restaurant> {
        const cacheKey = `restaurant:slug:${slug}`;
        const cachedRestaurant = await this.cachePort.get<Restaurant>(cacheKey);

        if (cachedRestaurant) {
            return cachedRestaurant;
        }

        const restaurant = await this.restaurantRepository.findBySlug(slug);

        if (!restaurant) {
            throw new AppError('Restaurant not found.', 404);
        }

        await this.cachePort.set(cacheKey, restaurant);

        return restaurant;
    }
}
