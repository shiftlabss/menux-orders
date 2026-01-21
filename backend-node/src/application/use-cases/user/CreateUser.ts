import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IHashProvider } from '@domain/providers/IHashProvider';
import { User } from '@domain/entities/User';
import { AppError } from '../../../shared/errors';

interface IRequest {
    name: string;
    email: string;
    password: string;
    role?: string;
    restaurantId: string;
    jobTitle?: string;
    phone?: string;
    avatarUrl?: string;
}

export class CreateUser {
    constructor(
        private userRepository: IUserRepository,
        private hashProvider: IHashProvider
    ) { }

    async execute({ name, email, password, role, restaurantId, jobTitle, phone, avatarUrl }: IRequest): Promise<User> {
        const checkUserExists = await this.userRepository.findByEmail(email);

        if (checkUserExists) {
            throw new AppError('Email address already used.', 400);
        }

        const passwordHash = await this.hashProvider.generateHash(password);

        const user = new User();
        user.name = name;
        user.email = email;
        user.passwordHash = passwordHash;
        user.role = role || 'user';
        user.restaurantId = restaurantId;
        user.jobTitle = jobTitle || '';
        user.phone = phone || '';
        user.avatarUrl = avatarUrl || '';

        return this.userRepository.create(user);
    }
}
