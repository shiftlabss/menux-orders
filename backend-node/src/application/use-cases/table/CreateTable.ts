import { ITableRepository } from '@domain/repositories/ITableRepository';
import { Table, TableStatus } from '@domain/entities/Table';
import { AppError } from '../../../shared/errors';

interface IRequest {
    number: number;
    capacity?: number;
    restaurantId: string;
}

export class CreateTable {
    constructor(
        private tableRepository: ITableRepository
    ) { }

    async execute({ number, capacity, restaurantId }: IRequest): Promise<Table> {
        if (number < 1 || number > 999) {
            throw new AppError('Table number must be between 1 and 999.', 400);
        }

        const tableExists = await this.tableRepository.findByNumber(restaurantId, number);

        if (tableExists) {
            throw new AppError('Table number already exists for this restaurant.', 400);
        }

        const table = new Table();
        table.number = number;
        table.capacity = capacity ?? 0;
        table.restaurantId = restaurantId;
        table.status = TableStatus.FREE;

        return this.tableRepository.create(table);
    }
}
