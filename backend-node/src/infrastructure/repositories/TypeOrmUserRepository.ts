import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { Repository, Raw } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmUserRepository implements IUserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create(user: User): Promise<User> {
        return this.repository.save(user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({
            where: { email },
            relations: ['restaurant'],
        });
    }

    async findById(id: string): Promise<User | null> {
        return this.repository.findOne({
            where: { id: Raw((alias) => `${alias} = :id::uuid`, { id }) },
            relations: ['restaurant'],
        });
    }

    async save(user: User): Promise<User> {
        return this.repository.save(user);
    }

    async findAll(): Promise<User[]> {
        return this.repository.find({
            relations: ['restaurant'],
        });
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }
}
