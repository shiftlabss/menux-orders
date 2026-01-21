import { Table, TableStatus } from '../entities/Table';

export interface ITableRepository {
    create(table: Table): Promise<Table>;
    save(table: Table): Promise<Table>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Table | undefined>;
    findByNumber(restaurantId: string, number: number): Promise<Table | undefined>;
    listByRestaurant(restaurantId: string): Promise<Table[]>;
    updateStatus(id: string, status: TableStatus): Promise<void>;
}
