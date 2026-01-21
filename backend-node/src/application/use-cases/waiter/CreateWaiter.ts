import { IWaiterRepository } from '@domain/repositories/IWaiterRepository';
import { Waiter } from '@domain/entities/Waiter';
import { AppError } from '../../../shared/errors';

interface IRequest {
    name: string;
    nickname?: string | null;
    avatarUrl?: string | null;
    pinCode: string;
    password?: string | null;
    restaurantId: string;
}

export class CreateWaiter {
    constructor(
        private waiterRepository: IWaiterRepository
    ) { }

    async execute({ name, nickname, avatarUrl, pinCode, password, restaurantId }: IRequest): Promise<Waiter> {
        // Check if PIN code is unique within the restaurant
        const pinExists = await this.waiterRepository.findByPinCode(restaurantId, pinCode);

        if (pinExists) {
            throw new AppError('PIN code already in use for this restaurant.', 400);
        }

        const waiter = new Waiter();
        waiter.name = name;
        waiter.nickname = nickname ?? null;
        waiter.avatarUrl = avatarUrl ?? null;
        waiter.pinCode = pinCode;
        waiter.password = password ?? null;
        waiter.restaurantId = restaurantId;

        return this.waiterRepository.create(waiter);
    }
}
