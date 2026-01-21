import { IUserRepository } from '@domain/repositories/IUserRepository';
import { AppError } from '@shared/errors';

interface IRequest {
    id: string;
}

export class DeleteUser {
    constructor(private userRepository: IUserRepository) { }

    async execute({ id }: IRequest): Promise<void> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        await this.userRepository.delete(id);
    }
}
