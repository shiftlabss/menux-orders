import { api } from './api';

export const restaurantService = {
    async getById(id) {
        const data = await api.get(`/restaurants/byId/${id}`);
        return data;
    }
};
