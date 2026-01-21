import { ITableRepository } from '@domain/repositories/ITableRepository';
import { AppError } from '../../../shared/errors';

export class DeleteTable {
    constructor(
        private tableRepository: ITableRepository
    ) { }

    async execute(id: string, restaurantId: string): Promise<void> {
        const table = await this.tableRepository.findById(id);

        if (!table) {
            throw new AppError('Table not found.', 404);
        }

        if (table.restaurantId !== restaurantId) {
            throw new AppError('Table does not belong to this restaurant.', 403);
        }

        await this.tableRepository.delete(id);
    }
}
