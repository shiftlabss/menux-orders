import { Waiter } from '../entities/Waiter';

export interface IWaiterRepository {
    create(waiter: Waiter): Promise<Waiter>;
    findById(id: string): Promise<Waiter | null>;
    findByRestaurantId(restaurantId: string): Promise<Waiter[]>;
    findByPinCode(restaurantId: string, pinCode: string): Promise<Waiter | null>;
    save(waiter: Waiter): Promise<Waiter>;
    delete(id: string): Promise<void>;
}
