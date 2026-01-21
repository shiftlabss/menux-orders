import { IRestaurantRepository } from '@domain/repositories/IRestaurantRepository';
import { Restaurant } from '@domain/entities/Restaurant';
import { slugify } from '../../../shared/utils/slugify';

interface IRequest {
    name: string;
    isActive?: boolean;
}

export class CreateRestaurant {
    constructor(
        private restaurantRepository: IRestaurantRepository
    ) { }

    private async generateUniqueSlug(name: string): Promise<string> {
        let slug = slugify(name);
        const slugExists = await this.restaurantRepository.findBySlug(slug);

        if (slugExists) {
            const randomSuffix = Math.floor(Math.random() * 1000);
            return this.generateUniqueSlug(`${slug}-${randomSuffix}`);
        }

        return slug;
    }

    async execute({ name, isActive }: IRequest): Promise<Restaurant> {
        const restaurant = new Restaurant();
        restaurant.name = name;
        restaurant.slug = await this.generateUniqueSlug(name);
        restaurant.isActive = isActive !== undefined ? isActive : true;

        return this.restaurantRepository.create(restaurant);
    }
}
