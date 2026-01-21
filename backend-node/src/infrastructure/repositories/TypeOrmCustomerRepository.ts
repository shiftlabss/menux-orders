import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';
import { Customer } from '@domain/entities/Customer';
import { ICustomerRepository } from '@domain/repositories/ICustomerRepository';

export class TypeOrmCustomerRepository implements ICustomerRepository {
    private ormRepository: Repository<Customer>;

    constructor() {
        this.ormRepository = AppDataSource.getRepository(Customer);
    }

    public async findById(id: string): Promise<Customer | undefined> {
        const customer = await this.ormRepository.findOne({
            where: { id },
            relations: ['orders', 'orders.items', 'orders.items.menuItem', 'orders.table'],
        });

        return customer || undefined;
    }

    public async findByEmail(email: string, restaurantId: string): Promise<Customer | undefined> {
        const customer = await this.ormRepository.findOne({
            where: { email, restaurantId },
        });

        return customer || undefined;
    }

    public async findByPhone(phone: string, restaurantId: string): Promise<Customer | undefined> {
        const customer = await this.ormRepository.findOne({
            where: { phone, restaurantId },
        });

        return customer || undefined;
    }

    public async listByRestaurant(restaurantId: string): Promise<Customer[]> {
        return this.ormRepository.find({
            where: { restaurantId },
            relations: ['orders'],
            order: { createdAt: 'DESC' }
        });
    }

    public async save(customer: Customer): Promise<Customer> {
        return this.ormRepository.save(customer);
    }

    public async delete(id: string): Promise<void> {
        await this.ormRepository.delete(id);
    }
}
