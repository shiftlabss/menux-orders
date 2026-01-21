import { api } from './api';

export const restaurantService = {
    async getBySlug(slug) {
        const data = await api.get(`/restaurants/${slug}`);
        return data;
    }
};
