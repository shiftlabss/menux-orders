import { api } from './api';

export const tableService = {
    async getTables() {
        const data = await api.get('/tables');
        return data.map(table => ({
            id: table.id,
            number: table.number,
            // Map backend 'number' to frontend display name
            name: `Mesa ${table.number}`,
            // Map backend status to frontend status
            status: mapStatus(table.status),
            // Map backend total to frontend string format
            amount: formatCurrency(table.summary?.totalConsumption || 0),
            // Keep original properties if needed
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
