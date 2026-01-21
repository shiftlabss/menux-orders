import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';
import { Customer } from '@domain/entities/Customer';
import { AppError } from '@shared/errors';

export class GetCustomerDetails {
    constructor(
        private customerRepository: ICustomerRepository
    ) { }

    async execute(id: string): Promise<any> {
        const customer = await this.customerRepository.findById(id);

        if (!customer) {
            throw new AppError('Customer not found', 404);
        }

        const totalSpent = customer.orders?.reduce((acc, order) => acc + Number(order.total), 0) || 0;
        const totalItems = customer.orders?.reduce((acc, order) => {
            return acc + (order.items?.reduce((itemAcc, item) => itemAcc + item.quantity, 0) || 0);
        }, 0) || 0;

        const preferences = {
            topCategories: this.calculateTopCategories(customer),
            topItems: this.calculateTopItems(customer)
        };

        const lastOrder = customer.orders?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
        const lastOrderDate = lastOrder?.createdAt;
        const lastOrderDaysAgo = lastOrderDate ? Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            customer_type: customer.customerType,
            anonId: customer.anonId,
            origin: customer.origin,
            since: customer.createdAt,
            metrics: {
                totalSpent,
                totalOrders: customer.orders?.length || 0,
                totalItems,
                ticketAverage: customer.orders?.length > 0 ? totalSpent / customer.orders.length : 0,
                lastOrderDate,
                lastOrderDaysAgo
            },
            rfm: {
                score: totalSpent > 500 ? 5.0 : 3.0,
                classification: totalSpent > 500 ? 'Campeão' : 'Novo',
                r: lastOrderDaysAgo < 30 ? 5 : 3,
                f: (customer.orders?.length || 0) > 5 ? 5 : 3,
                m: totalSpent > 500 ? 5 : 3
            },
            predictions: {
                nextBestAction: 'Enviar Cupom de Retorno',
                nextPurchaseProbability: 85,
                likelyToChurn: false
            },
            risk: {
                churnRisk: lastOrderDaysAgo > 60 ? 'Alto' : 'Baixo',
                churnProbability: lastOrderDaysAgo > 60 ? 70 : 15
            },
            tags: customer.customerType === 'anonymous' ? ['Anônimo'] : (totalSpent > 1000 ? ['VIP'] : ['Comum']),
            preferences,
            orders: customer.orders?.map(order => ({
                id: order.id,
                code: order.code,
                status: order.status,
                total: order.total,
                createdAt: order.createdAt,
                tableNumber: order.tableNumber || order.table?.number,
                items: order.items?.map(item => ({
                    id: item.id,
                    name: item.menuItem?.name || 'Desconhecido',
                    quantity: item.quantity,
                    price: item.price
                }))
            })) || []
        };
    }

    private calculateTopCategories(customer: Customer): string[] {
        const categories: Record<string, number> = {};
        customer.orders?.forEach(order => {
            order.items?.forEach(item => {
                const catName = item.menuItem?.category?.name || 'Outros';
                categories[catName] = (categories[catName] || 0) + item.quantity;
            });
        });
        return Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);
    }

    private calculateTopItems(customer: Customer): string[] {
        const items: Record<string, number> = {};
        customer.orders?.forEach(order => {
            order.items?.forEach(item => {
                const itemName = item.menuItem?.name || 'Desconhecido';
                items[itemName] = (items[itemName] || 0) + item.quantity;
            });
        });
        return Object.entries(items)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name]) => name);
    }
}
