import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IHashProvider } from '@domain/providers/IHashProvider';
import { ITokenProvider } from '@domain/providers/ITokenProvider';
import { User } from '@domain/entities/User';
import { AppError } from '../../../shared/errors';

interface IRequest {
    email: string;
    password: string;
}

interface IResponse {
    user: User;
    access_token: string;
}

export class AuthenticateUser {
    constructor(
        private userRepository: IUserRepository,
        private hashProvider: IHashProvider,
        private tokenProvider: ITokenProvider
    ) { }

    async execute({ email, password }: IRequest): Promise<IResponse> {
        const user = await this.userRepository.findByEmail(email);

        console.log(user);

        if (!user) {
            throw new AppError('Incorrect email/password combination.', 401);
        }

        const passwordMatched = await this.hashProvider.compareHash(password, user.passwordHash);

        if (!passwordMatched) {
            throw new AppError('Incorrect email/password combination.', 401);
        }

        const token = this.tokenProvider.generateToken({
            sub: user.id,
            role: user.role,
            restaurantId: user.restaurantId,
        });

        return {
            user,
            access_token: token,
        };
    }
}
