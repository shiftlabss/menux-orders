import { Customer } from '../entities/Customer';

export interface ICustomerRepository {
    findById(id: string): Promise<Customer | undefined>;
    findByEmail(email: string, restaurantId: string): Promise<Customer | undefined>;
    findByPhone(phone: string, restaurantId: string): Promise<Customer | undefined>;
    listByRestaurant(restaurantId: string): Promise<Customer[]>;
    save(customer: Customer): Promise<Customer>;
    delete(id: string): Promise<void>;
}
