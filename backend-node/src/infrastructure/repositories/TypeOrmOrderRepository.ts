import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';
import { Order } from '@domain/entities/Order';
import { IOrderRepository } from '@domain/repositories/IOrderRepository';

export class TypeOrmOrderRepository implements IOrderRepository {
    private ormRepository: Repository<Order>;

    constructor() {
        this.ormRepository = AppDataSource.getRepository(Order);
    }

    public async findById(id: string): Promise<Order | undefined> {
        const order = await this.ormRepository.findOne({
            where: { id },
            relations: ['items', 'items.menuItem', 'restaurant', 'waiter', 'table'],
        });

        return order || undefined;
    }

    public async save(order: Order): Promise<Order> {
        return this.ormRepository.save(order);
    }

    // public async listByRestaurant(restaurantId: string): Promise<Order[]> {
    //     return this.ormRepository.find({
    //         where: { restaurantId },
    //         relations: ['items', 'items.menuItem', 'waiter', 'table'],
    //         order: { createdAt: 'DESC' }
    //     });
    // }

    public async listByRestaurant(restaurantId: string): Promise<Order[]> {
        const query = this.ormRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.waiter', 'waiter')
            .leftJoinAndSelect('order.table', 'table')
            .where('order.restaurantId = :restaurantId', { restaurantId })
            .orderBy('order.createdAt', 'DESC')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoin('items.menuItem', 'menuItem')
            .addSelect([
                'menuItem.id',
                'menuItem.name',
                'menuItem.description',
                'menuItem.price',
                'menuItem.categoryId',
                'menuItem.isActive',
                'menuItem.code'
                // Explicitly NOT selecting menuItem.imageUrl
            ]);


        return query.getMany();
    }

    public async findByTransactionId(transactionId: string): Promise<Order | undefined> {
        const order = await this.ormRepository.findOne({
            where: { transactionId },
            relations: ['items', 'items.menuItem', 'waiter', 'table'],
        });
        return order || undefined;
    }

    public async existsByCodeInLast24h(code: string, restaurantId: string): Promise<boolean> {
        const result = await this.ormRepository.createQueryBuilder('order')
            .where('order.code = :code', { code })
            .andWhere('order.restaurantId = :restaurantId', { restaurantId })
            .andWhere('order.createdAt > :date', { date: new Date(Date.now() - 24 * 60 * 60 * 1000) })
            .getCount();

        return result > 0;
    }

    public async findByCustomerInLast24h(customerId: string, restaurantId: string): Promise<Order[]> {
        const date24AhAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        return this.ormRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.menuItem', 'menuItem')
            // .leftJoinAndSelect('order.restaurant', 'restaurant')
            .leftJoinAndSelect('order.waiter', 'waiter')
            .leftJoinAndSelect('order.table', 'table')
            .where('order.customerId = :customerId', { customerId })
            .andWhere('order.restaurantId = :restaurantId', { restaurantId })
            .andWhere('order.createdAt > :date', { date: date24AhAgo })
            .orderBy('order.createdAt', 'DESC')
            .getMany();
    }

    public async findByTemporaryCustomerInLast24h(temporaryCustomerId: string, restaurantId: string): Promise<Order[]> {
        const date24AhAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        return this.ormRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.menuItem', 'menuItem')
            // .leftJoinAndSelect('order.restaurant', 'restaurant')
            .leftJoinAndSelect('order.waiter', 'waiter')
            .leftJoinAndSelect('order.table', 'table')
            .where('order.temporaryCustomerId = :temporaryCustomerId', { temporaryCustomerId })
            .andWhere('order.restaurantId = :restaurantId', { restaurantId })
            .andWhere('order.createdAt > :date', { date: date24AhAgo })
            .orderBy('order.createdAt', 'DESC')
            .getMany();
    }

    public async calculateDailyMetrics(restaurantId: string, date: Date): Promise<{ totalOrders: number; totalRevenue: number; averageDecisionTime: number }> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const result = await this.ormRepository.createQueryBuilder('order')
            .select('COUNT(order.id)', 'totalOrders')
            .addSelect('SUM(order.total)', 'totalRevenue')
            .addSelect('AVG(order.totalDecisionTime)', 'averageDecisionTime')
            .where('order.restaurantId = :restaurantId', { restaurantId })
            .andWhere('order.createdAt BETWEEN :start AND :end', { start: startOfDay, end: endOfDay })
            .andWhere('order.status != :canceledStatus', { canceledStatus: 'CANCELED' })
            .getRawOne();

        return {
            totalOrders: Number(result.totalOrders || 0),
            totalRevenue: Number(result.totalRevenue || 0),
            averageDecisionTime: Number(result.averageDecisionTime || 0)
        };
    }

    public async getSalesByProduct(restaurantId: string, startDate: Date, endDate: Date): Promise<{ menuItemId: string; totalSold: number; totalRevenue: number }[]> {
        const result = await this.ormRepository.createQueryBuilder('order')
            .innerJoin('order.items', 'item')
            .select('item.menuItemId', 'menuItemId')
            .addSelect('SUM(item.quantity)', 'totalSold')
            .addSelect('SUM(item.price * item.quantity)', 'totalRevenue')
            .where('order.restaurantId = :restaurantId', { restaurantId })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.status != :canceledStatus', { canceledStatus: 'CANCELED' })
            .groupBy('item.menuItemId')
            .getRawMany();

        return result.map(row => ({
            menuItemId: row.menuItemId,
            totalSold: Number(row.totalSold || 0),
            totalRevenue: Number(row.totalRevenue || 0)
        }));
    }

    public async findByDateRange(restaurantId: string, startDate: Date, endDate: Date, status?: string): Promise<Order[]> {
        const query = this.ormRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.menuItem', 'menuItem')
            // .leftJoinAndSelect('order.restaurant', 'restaurant')
            .leftJoinAndSelect('order.waiter', 'waiter')
            .leftJoinAndSelect('order.table', 'table')
            .where('order.restaurantId = :restaurantId', { restaurantId })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });

        if (status) {
            query.andWhere('order.status = :status', { status });
        }

        query.orderBy('order.createdAt', 'DESC');

        return query.getMany();
    }

    public async findSoldItemsByDateRange(restaurantId: string, startDate: Date, endDate: Date, isSuggestion?: boolean): Promise<any[]> {
        const query = this.ormRepository.createQueryBuilder('order')
            .innerJoin('order.items', 'item')
            .innerJoin('item.menuItem', 'menuItem')
            .leftJoin('menuItem.category', 'category')
            .select('menuItem.id', 'id')
            .addSelect('menuItem.name', 'name')
            .addSelect('category.name', 'categoryName')
            .addSelect('SUM(item.quantity)', 'quantity')
            .addSelect('SUM(item.quantity * item.price)', 'total')
            .where('order.restaurantId = :restaurantId', { restaurantId })
            .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
            .andWhere('order.status != :canceledStatus', { canceledStatus: 'CANCELED' }); // Don't count canceled orders? User didn't specify, but typical.

        if (isSuggestion !== undefined) {
            if (isSuggestion) {
                query.andWhere('item.isSuggestion = :isSuggestion', { isSuggestion: true });
            }
            // If false, maybe returns all? Or only non-suggestions?
            // "opção de filtro por todos os itens ou apenas itens que foram sugeridos" -> Filter by all OR only suggestions.
            // So if isSuggestion is explicitly passed as true, we filter. If undefined/null, we get all. 
            // If user passes false, maybe they want non-suggestions? The prompt says "filter by ... only items that were suggested", implies toggle.
            // I'll assume: if isSuggestion is true, filter. If it's false/undefined, return all (or handle per param). 
            // Re-reading: "option to filter by ALL items OR ONLY items that were suggested". 
            // So if param is present and true -> filter. Else -> all.
        }

        query.groupBy('menuItem.id')
            .addGroupBy('menuItem.name')
            .addGroupBy('category.name');

        const result = await query.getRawMany();

        return result.map(row => ({
            id: row.id,
            name: row.name,
            category: row.categoryName || 'Sem Categoria',
            quantity: Number(row.quantity),
            total: Number(row.total)
        }));
    }
    public async listByRestaurantCompact(restaurantId: string, includeItems: boolean = true): Promise<Order[]> {
        const query = this.ormRepository.createQueryBuilder('order')
            .leftJoinAndSelect('order.waiter', 'waiter')
            .leftJoinAndSelect('order.table', 'table')
            .where('order.restaurantId = :restaurantId', { restaurantId })
            .orderBy('order.createdAt', 'DESC');

        if (includeItems) {
            query.leftJoinAndSelect('order.items', 'items')
                .leftJoin('items.menuItem', 'menuItem')
                .addSelect([
                    'menuItem.id',
                    'menuItem.name',
                    'menuItem.description',
                    'menuItem.price',
                    'menuItem.categoryId',
                    'menuItem.isActive',
                    'menuItem.code'
                    // Explicitly NOT selecting menuItem.imageUrl
                ]);
        }

        return query.getMany();
    }
}
