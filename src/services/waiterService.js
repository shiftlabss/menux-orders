import { api } from './api';

export const waiterService = {
    auth(pinCode, password, restaurantId) {
        return api.post('/waiters/auth', {
            pinCode,
            password,
            restaurantId
        });
    }
};
