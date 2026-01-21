import { IOrderRepository } from '@domain/repositories/IOrderRepository';
import { TypeOrmAnalyticsRepository } from '@infrastructure/repositories/TypeOrmAnalyticsRepository';
// import { IMenuItemRepository } from '@domain/repositories/IMenuItemRepository';
import { TypeOrmMenuItemRepository } from '@infrastructure/repositories/TypeOrmMenuItemRepository';

export class GetTopProducts {
    constructor(
        private orderRepository: IOrderRepository,
        private analyticsRepository: TypeOrmAnalyticsRepository,
        private menuItemRepository: TypeOrmMenuItemRepository
    ) { }

    async execute(restaurantId: string, period: string): Promise<any[]> {
        const { startDate, endDate } = this.getDateRange(period);

        // 1. Get Sales Data
        const salesData = await this.orderRepository.getSalesByProduct(restaurantId, startDate, endDate);

        // 2. Get Analytics Data
        // Mapping types: 'impression' (Vis), 'view_item' (Click/Detail), 'add_to_cart' (Cart)
        const analyticsData = await this.analyticsRepository.getEventsSummaryByProduct(startDate, endDate, ['impression', 'view_item', 'add_to_cart']);

        // 3. Merge Data
        const productMap = new Map<string, any>();

        // Initialize with sales
        for (const sale of salesData) {
            if (!productMap.has(sale.menuItemId)) {
                productMap.set(sale.menuItemId, { id: sale.menuItemId, revenue: sale.totalRevenue, orders: sale.totalSold, views: 0, clicks: 0, cart: 0 });
            } else {
                const p = productMap.get(sale.menuItemId);
                p.revenue = sale.totalRevenue;
                p.orders = sale.totalSold;
            }
        }

        // Merge analytics
        // Merge analytics
        for (const event of analyticsData) {
            if (!productMap.has(event.itemId)) {
                productMap.set(event.itemId, { id: event.itemId, revenue: 0, orders: 0, views: 0, clicks: 0, cart: 0 });
            }
            const p = productMap.get(event.itemId);

            // Context-based mapping
            const context = (event.context || '').toLowerCase();
            const isDetail = context.includes('detail') || context.includes('modal');

            if (event.type === 'impression') {
                if (isDetail) {
                    // Impression on detail page counts as a click (user viewed details)
                    p.clicks = (p.clicks || 0) + event.count;
                } else {
                    // Standard impression (list view)
                    p.views = (p.views || 0) + event.count;
                }
            } else if (event.type === 'view_item') {
                // Explicit view_item event is also a click
                p.clicks = (p.clicks || 0) + event.count;
            } else if (event.type === 'add_to_cart') {
                p.cart = (p.cart || 0) + event.count;
            }
        }

        // 4. Fetch Details for Top N (e.g. Top 50 by Revenue)
        const allProducts = Array.from(productMap.values());
        // Sort by Revenue DESC
        allProducts.sort((a, b) => b.revenue - a.revenue);

        const topProducts = allProducts.slice(0, 50);

        // Fetch details
        const result = [];
        for (const p of topProducts) {
            const details = await this.menuItemRepository.findById(p.id);
            if (details) {
                // Calculate conversion (Orders / Impressions * 100)
                // Use safe division
                const base = p.views;
                const conversionRate = base > 0 ? (p.orders / base) * 100 : 0;

                result.push({
                    id: details.id,
                    name: details.name,
                    category: details.category?.name || 'Geral',
                    image: details.imageUrl,
                    funnel: {
                        vis: p.views,
                        cliq: p.clicks,
                        carr: p.cart,
                        ped: p.orders
                    },
                    conversion: {
                        current: parseFloat(conversionRate.toFixed(2)),
                        delta: 0,       // TODO: Implement comparison with previous period
                        trend: 'up',    // TODO: Implement trend logic
                        base: base
                    },
                    revenue: {
                        current: parseFloat(Number(p.revenue).toFixed(2)),
                        trend: '+0%',   // TODO: Implement trend logic
                        ticket: p.orders > 0 ? parseFloat((p.revenue / p.orders).toFixed(2)) : 0
                    },
                    status: details.tags || [],
                    maestro: null // TODO: Implement Maestro recommendations
                });
            }
        }

        return result;
    }

    private getDateRange(period: string): { startDate: Date, endDate: Date } {
        const now = new Date();
        const startDate = new Date();
        const endDate = new Date();

        // Default to Today
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        if (period === 'Ontem') {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            startDate.setTime(yesterday.getTime());
            startDate.setHours(0, 0, 0, 0);

            endDate.setTime(yesterday.getTime());
            endDate.setHours(23, 59, 59, 999);
        } else if (period === '7 dias' || period === '7d') {
            startDate.setDate(now.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === '30 dias' || period === '30d') {
            startDate.setDate(now.getDate() - 30);
            startDate.setHours(0, 0, 0, 0);
        }

        return { startDate, endDate };
    }
}
