import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { AppError } from '@shared/errors';

interface IRequest {
    userId: string;
}

export class GetUserProfile {
    constructor(private userRepository: IUserRepository) { }

    async execute({ userId }: IRequest): Promise<User> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }
}
