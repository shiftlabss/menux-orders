import { api } from './api';

export const tableService = {
    async getTables() {
        const restaurantId = localStorage.getItem('restaurantId');
        // Providing fallback for restaurantId if null, though it should be set
        const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
        const data = await api.get(`/tables${query}`);

        return data.map(table => ({
            id: table.id,
            number: table.number,
            name: `Mesa ${table.number}`,
            status: mapStatus(table.status),
            amount: formatCurrency(table.summary?.totalConsumption || 0),
            originalStatus: table.status,
            capacity: table.capacity,
            waiterId: table.waiterId,
            restaurantId: table.restaurantId
        }));
    },

    async getTableOrders(tableId) {
        const restaurantId = localStorage.getItem('restaurantId');
        const orders = await api.get(`/orders?tableId=${tableId}&restaurantId=${restaurantId}`);
        // Filter out closed/canceled orders if necessary, although the backend might return all.
        // Usually for "current state" we might want only active ones.
        // Let's assume frontend filtering for now: status NOT 'FINISHED' or 'CANCELED'
        return orders.filter(o => !['FINISHED', 'CANCELED'].includes(o.status));
    },

    async releaseTable(tableId) {
        const restaurantId = localStorage.getItem('restaurantId');
        return api.post(`/tables/${tableId}/release?restaurantId=${restaurantId}`, {});
    },

    async transferTable(data) {
        // data: { restaurantId, sourceTableNumber, destinationTableNumber, waiterCode, waiterPassword }
        // Ensure restaurantId is set if not provided (though Sidebar should provide it)
        if (!data.restaurantId) {
            data.restaurantId = localStorage.getItem('restaurantId');
        }

        return api.post('/tables/transfer', data);
        return orders.filter(o => !['FINISHED', 'CANCELED'].includes(o.status));
    },

    async removeItem(tableId, itemId, waiterCode, waiterPassword) {
        const restaurantId = localStorage.getItem('restaurantId');
        // This is a MOCK implementation / placeholder for the actual endpoint
        // If the backend doesn't have this exact endpoint, we might need to adjust.
        // Assuming a structure for authentication + deletion.

        // For now, let's assume we post to a cancellation endpoint or use a specific delete logic
        return api.post(`/orders/CancelItem`, {
            restaurantId,
            tableId,
            itemId,
            waiterCode,
            waiterPassword
        });
    }
};

function mapStatus(backendStatus) {
    const map = {
        'FREE': 'Livre',
        'OCCUPIED': 'Ocupada',
        'CLOSING': 'Encerrando',
        'CLOSED': 'Encerrada'
    };
    return map[backendStatus] || 'Livre';
}

function formatCurrency(value) {
    // Assuming value is a number like 123.45 -> "123,45"
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
