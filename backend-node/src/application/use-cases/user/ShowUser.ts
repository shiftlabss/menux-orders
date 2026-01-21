import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { AppError } from '@shared/errors';

interface IRequest {
    id: string;
}

export class ShowUser {
    constructor(private userRepository: IUserRepository) { }

    async execute({ id }: IRequest): Promise<User> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    }
}
