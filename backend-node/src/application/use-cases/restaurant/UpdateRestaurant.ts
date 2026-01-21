import { IRestaurantRepository } from '@domain/repositories/IRestaurantRepository';
import { Restaurant } from '@domain/entities/Restaurant';
import { AppError } from '../../../shared/errors';
import { slugify } from '../../../shared/utils/slugify';
import { ICachePort } from '@application/ports/ICachePort';

interface IRequest {
    id: string;
    name?: string;
    tradingName?: string;
    corporateName?: string;
    cnpj?: string;
    logoUrl?: string;
    headerUrl?: string;
    description?: string;
    phone?: string;
    email?: string;
    address?: string;
    openingHours?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
}

export class UpdateRestaurant {
    constructor(
        private restaurantRepository: IRestaurantRepository,
        private cachePort: ICachePort
    ) { }

    private async generateUniqueSlug(name: string, currentRestaurantId: string): Promise<string> {
        let slug = slugify(name);
        const slugExists = await this.restaurantRepository.findBySlug(slug);

        if (slugExists && slugExists.id !== currentRestaurantId) {
            slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
            // Recursively check again if the new random slug exists (unlikely but safe)
            return this.generateUniqueSlug(slug, currentRestaurantId);
        }

        return slug;
    }

    async execute(data: IRequest): Promise<Restaurant> {
        const restaurant = await this.restaurantRepository.findById(data.id);

        if (!restaurant) {
            throw new AppError('Restaurant not found.', 404);
        }

        const originalSlug = restaurant.slug;

        // Handle slug generation automatically only if name changes
        if (data.name && data.name !== restaurant.name) {
            restaurant.slug = await this.generateUniqueSlug(data.name, restaurant.id);
        }

        // Update fields
        if (data.name) restaurant.name = data.name;
        if (data.tradingName !== undefined) restaurant.tradingName = data.tradingName;
        if (data.corporateName !== undefined) restaurant.corporateName = data.corporateName;
        if (data.cnpj !== undefined) restaurant.cnpj = data.cnpj;
        if (data.logoUrl !== undefined) restaurant.logoUrl = data.logoUrl;
        if (data.headerUrl !== undefined) restaurant.headerUrl = data.headerUrl;
        if (data.description !== undefined) restaurant.description = data.description;
        if (data.phone !== undefined) restaurant.phone = data.phone;
        if (data.email !== undefined) restaurant.email = data.email;
        if (data.address !== undefined) restaurant.address = data.address;
        if (data.openingHours !== undefined) restaurant.openingHours = data.openingHours;
        if (data.instagram !== undefined) restaurant.instagram = data.instagram;
        if (data.facebook !== undefined) restaurant.facebook = data.facebook;
        if (data.whatsapp !== undefined) restaurant.whatsapp = data.whatsapp;
        if (data.website !== undefined) restaurant.website = data.website;

        const updatedRestaurant = await this.restaurantRepository.save(restaurant);

        await this.cachePort.del(`restaurant:slug:${originalSlug}`);
        if (originalSlug !== updatedRestaurant.slug) {
            await this.cachePort.del(`restaurant:slug:${updatedRestaurant.slug}`);
        }

        return updatedRestaurant;
    }
}
