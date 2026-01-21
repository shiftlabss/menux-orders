import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { AppError } from '@shared/errors';
import { IHashProvider } from '@domain/providers/IHashProvider';

interface IRequest {
    id: string;
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    restaurantId?: string;
    jobTitle?: string;
    phone?: string;
    avatarUrl?: string;
}

export class UpdateUser {
    constructor(
        private userRepository: IUserRepository,
        private hashProvider: IHashProvider
    ) { }

    async execute({ id, name, email, password, role, restaurantId, jobTitle, phone, avatarUrl }: IRequest): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (email && email !== user.email) {
            const checkUserExists = await this.userRepository.findByEmail(email);

            if (checkUserExists) {
                throw new AppError('Email address already used.', 400);
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (role) user.role = role;
        if (restaurantId) user.restaurantId = restaurantId;
        if (jobTitle) user.jobTitle = jobTitle;
        if (phone) user.phone = phone;
        if (avatarUrl) user.avatarUrl = avatarUrl;

        if (password) {
            user.passwordHash = await this.hashProvider.generateHash(password);
        }

        return this.userRepository.save(user);
    }
}
