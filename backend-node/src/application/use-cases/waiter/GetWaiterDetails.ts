import { IWaiterRepository } from '@domain/repositories/IWaiterRepository';
import { Waiter } from '@domain/entities/Waiter';
import { AppError } from '../../../shared/errors';

export class GetWaiterDetails {
    constructor(
        private waiterRepository: IWaiterRepository
    ) { }

    async execute(id: string): Promise<Waiter> {
        const waiter = await this.waiterRepository.findById(id);

        if (!waiter) {
            throw new AppError('Waiter not found.', 404);
        }

        return waiter;
    }
}
