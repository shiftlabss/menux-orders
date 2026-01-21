import { IRestaurantRepository } from '@domain/repositories/IRestaurantRepository';
import { Restaurant } from '@domain/entities/Restaurant';
import { AppError } from '../../../shared/errors';

export class GetRestaurant {
    constructor(
        private restaurantRepository: IRestaurantRepository
    ) { }

    async execute(id: string): Promise<Restaurant> {
        const restaurant = await this.restaurantRepository.findById(id);

        if (!restaurant) {
            throw new AppError('Restaurant not found.', 404);
        }

        return restaurant;
    }
}
