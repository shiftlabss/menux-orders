import { IWaiterRepository } from '@domain/repositories/IWaiterRepository';
import { Waiter } from '@domain/entities/Waiter';
import { AppError } from '../../../shared/errors';

interface IRequest {
    id: string;
    name?: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    pinCode?: string;
    password?: string | null;
}

export class UpdateWaiter {
    constructor(
        private waiterRepository: IWaiterRepository
    ) { }

    async execute({ id, name, nickname, avatarUrl, pinCode, password }: IRequest): Promise<Waiter> {
        const waiter = await this.waiterRepository.findById(id);

        if (!waiter) {
            throw new AppError('Waiter not found.', 404);
        }

        if (pinCode && pinCode !== waiter.pinCode) {
            const pinExists = await this.waiterRepository.findByPinCode(waiter.restaurantId, pinCode);
            if (pinExists) {
                throw new AppError('PIN code already in use for this restaurant.', 400);
            }
            waiter.pinCode = pinCode;
        }

        if (name) waiter.name = name;
        if (nickname !== undefined) waiter.nickname = nickname ?? null;
        if (avatarUrl !== undefined) waiter.avatarUrl = avatarUrl ?? null;
        if (password !== undefined) waiter.password = password ?? null;

        return this.waiterRepository.save(waiter);
    }
}
