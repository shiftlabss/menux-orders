import { ITableRepository } from '@domain/repositories/ITableRepository';
import { Table, TableStatus } from '@domain/entities/Table';
import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmTableRepository implements ITableRepository {
    private repository: Repository<Table>;

    constructor() {
        this.repository = AppDataSource.getRepository(Table);
    }

    async create(table: Table): Promise<Table> {
        return this.repository.save(table);
    }

    async save(table: Table): Promise<Table> {
        return this.repository.save(table);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async findById(id: string): Promise<Table | undefined> {
        const table = await this.repository.findOne({
            where: { id },
            relations: ['waiter', 'orders', 'orders.items', 'orders.items.menuItem', 'orders.waiter']
        });
        return table || undefined;
    }

    async findByNumber(restaurantId: string, number: number): Promise<Table | undefined> {
        const table = await this.repository.findOne({ where: { restaurantId, number } });
        return table || undefined;
    }

    async listByRestaurant(restaurantId: string): Promise<Table[]> {
        return this.repository.find({
            where: { restaurantId },
            relations: ['waiter', 'orders', 'orders.items', 'orders.items.menuItem', 'orders.waiter'],
            order: { number: 'ASC' }
        });
    }

    async updateStatus(id: string, status: TableStatus): Promise<void> {
        await this.repository.update(id, { status });
    }
}
