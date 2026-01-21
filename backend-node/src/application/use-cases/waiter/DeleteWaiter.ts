import { IWaiterRepository } from '@domain/repositories/IWaiterRepository';
import { AppError } from '../../../shared/errors';

export class DeleteWaiter {
    constructor(
        private waiterRepository: IWaiterRepository
    ) { }

    async execute(id: string): Promise<void> {
        const waiter = await this.waiterRepository.findById(id);

        if (!waiter) {
            throw new AppError('Waiter not found.', 404);
        }

        await this.waiterRepository.delete(id);
    }
}
