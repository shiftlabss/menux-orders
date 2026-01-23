import { api } from './api';

export const orderService = {
    getOrderByCode(code, restaurantId, waiterToken) {
        return api.request(`/orders/code/${code}?restaurantId=${restaurantId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${waiterToken}`
            }
        });
    },

    confirmByCode(code, tableNumber, restaurantId, waiterToken, waiterInfo) {
        return api.request(`/orders/confirm-by-code?restaurantId=${restaurantId}`, {
            method: 'POST',
            body: JSON.stringify({
                code,
                tableNumber,
                waiterName: waiterInfo?.name,
                waiterNickname: waiterInfo?.nickname,
                waiterId: waiterInfo?.id
            }),
            headers: {
                'Authorization': `Bearer ${waiterToken}`
            }
        });
    }
};
