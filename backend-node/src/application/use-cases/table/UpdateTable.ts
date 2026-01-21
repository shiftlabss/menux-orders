import { ITableRepository } from '@domain/repositories/ITableRepository';
import { Table, TableStatus, TablePriority } from '@domain/entities/Table';
import { AppError } from '../../../shared/errors';

interface IRequest {
    id: string;
    number?: number;
    capacity?: number;
    currentPeople?: number;
    status?: TableStatus;
    priority?: TablePriority | null;
    waiterId?: string | null;
    openedAt?: Date | null;
    closedAt?: Date | null;
    restaurantId: string;
}

export class UpdateTable {
    constructor(
        private tableRepository: ITableRepository
    ) { }

    async execute(data: IRequest): Promise<Table> {
        const table = await this.tableRepository.findById(data.id);

        if (!table) {
            throw new AppError('Table not found.', 404);
        }

        if (table.restaurantId !== data.restaurantId) {
            throw new AppError('Table does not belong to this restaurant.', 403);
        }

        if (data.number !== undefined) {
            if (data.number < 1 || data.number > 999) {
                throw new AppError('Table number must be between 1 and 999.', 400);
            }

            if (data.number !== table.number) {
                const tableExists = await this.tableRepository.findByNumber(data.restaurantId, data.number);
                if (tableExists) {
                    throw new AppError('Table number already exists for this restaurant.', 400);
                }
                table.number = data.number;
            }
        }

        if (data.capacity !== undefined) table.capacity = data.capacity;
        if (data.currentPeople !== undefined) table.currentPeople = data.currentPeople;
        if (data.status !== undefined) table.status = data.status;
        if (data.priority !== undefined) table.priority = data.priority;
        if (data.waiterId !== undefined) table.waiterId = data.waiterId;
        if (data.openedAt !== undefined) table.openedAt = data.openedAt;
        if (data.closedAt !== undefined) table.closedAt = data.closedAt;

        // Validation: priority can only have a value if status is not FREE
        if (table.status === TableStatus.FREE && table.priority !== null) {
            table.priority = null;
        }

        return this.tableRepository.save(table);
    }
}
