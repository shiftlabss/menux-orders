import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';

export class ListCustomersByRestaurant {
    constructor(
        private customerRepository: ICustomerRepository
    ) { }

    async execute(restaurantId: string): Promise<any[]> {
        const customers = await this.customerRepository.listByRestaurant(restaurantId);

        return customers.map(customer => {
            const totalSpent = customer.orders?.reduce((acc, order) => acc + Number(order.total), 0) || 0;
            const lastOrder = customer.orders?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

            // RFM Analysis Simulation
            const lastOrderDate = lastOrder?.createdAt;
            const totalOrders = customer.orders?.length || 0;
            const lastOrderDaysAgo = lastOrderDate ? Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                customer_type: customer.customerType,
                anon_id: customer.anonId,
                origin: customer.origin,
                since: customer.createdAt,
                metrics: {
                    totalSpent,
                    totalOrders,
                    lastOrderDate: lastOrderDate?.toISOString(),
                    lastOrderDaysAgo,
                    ticketAverage: totalOrders > 0 ? totalSpent / totalOrders : 0,
                    frequencyDays: totalOrders > 1 ? Math.floor(365 / totalOrders) : 0,
                    ltv: totalSpent * 1.3 // Simulated LTV
                },
                rfm: {
                    score: totalSpent > 500 ? 5.0 : 3.0,
                    classification: totalSpent > 500 ? 'Campeão' : 'Novo',
                    r: lastOrderDaysAgo < 30 ? 5 : 3,
                    f: totalOrders > 5 ? 5 : 3,
                    m: totalSpent > 500 ? 5 : 3
                },
                preferences: {
                    topCategory: 'Pratos Principais',
                    channel: 'Salão'
                },
                predictions: {
                    nextBestAction: 'Enviar Cupom de Retorno'
                },
                tags: (() => {
                    const t = [];
                    if (customer.customerType === 'anonymous') t.push('Anônimo');
                    if (totalSpent > 1000) t.push('VIP');
                    if (lastOrderDaysAgo > 60) t.push('Em Risco');
                    if (totalOrders === 1 && lastOrderDaysAgo < 30) t.push('Novo');
                    if (totalOrders > 5) t.push('Leal');
                    if (t.length === 0) t.push('Comum');
                    return t;
                })()
            };
        });
    }
}
