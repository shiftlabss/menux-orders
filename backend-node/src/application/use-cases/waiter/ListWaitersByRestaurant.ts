import { IWaiterRepository } from '@domain/repositories/IWaiterRepository';
import { Waiter } from '@domain/entities/Waiter';

export class ListWaitersByRestaurant {
    constructor(
        private waiterRepository: IWaiterRepository
    ) { }

    async execute(restaurantId: string): Promise<Waiter[]> {
        return this.waiterRepository.findByRestaurantId(restaurantId);
    }
}
