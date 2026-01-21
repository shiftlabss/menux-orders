import { User } from '../entities/User';

export interface IUserRepository {
    create(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    save(user: User): Promise<User>;
    findAll(): Promise<User[]>;
    delete(id: string): Promise<void>;
}
