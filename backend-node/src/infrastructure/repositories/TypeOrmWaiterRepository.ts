import { IWaiterRepository } from '@domain/repositories/IWaiterRepository';
import { Waiter } from '@domain/entities/Waiter';
import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmWaiterRepository implements IWaiterRepository {
    private repository: Repository<Waiter>;

    constructor() {
        this.repository = AppDataSource.getRepository(Waiter);
    }

    async create(waiter: Waiter): Promise<Waiter> {
        return this.repository.save(waiter);
    }

    async findById(id: string): Promise<Waiter | null> {
        return this.repository.findOne({ where: { id } });
    }

    async findByRestaurantId(restaurantId: string): Promise<Waiter[]> {
        return this.repository.find({
            where: { restaurantId },
            order: { name: 'ASC' }
        });
    }

    async findByPinCode(restaurantId: string, pinCode: string): Promise<Waiter | null> {
        return this.repository.findOne({ where: { restaurantId, pinCode } });
    }

    async save(waiter: Waiter): Promise<Waiter> {
        return this.repository.save(waiter);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
