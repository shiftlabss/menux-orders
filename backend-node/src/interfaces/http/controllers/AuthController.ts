import { Request, Response } from 'express';
import { AuthenticateUser } from '@application/use-cases/auth/AuthenticateUser';
import { TypeOrmUserRepository } from '@infrastructure/repositories/TypeOrmUserRepository';
import { BCryptHashProvider } from '@infrastructure/providers/BCryptHashProvider';
import { JwtTokenProvider } from '@infrastructure/providers/JwtTokenProvider';
import { GetUserProfile } from '@application/use-cases/auth/GetUserProfile';

export class AuthController {
    public async login(req: Request, res: Response): Promise<Response> {
        const { email, password } = req.body;

        const userRepository = new TypeOrmUserRepository();
        const hashProvider = new BCryptHashProvider();
        const tokenProvider = new JwtTokenProvider();

        const authenticateUser = new AuthenticateUser(
            userRepository,
            hashProvider,
            tokenProvider
        );

        const { user, access_token } = await authenticateUser.execute({
            email,
            password,
        });

        // Don't return password hash
        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId,
            jobTitle: user.jobTitle,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        };

        return res.json({ user: userResponse, access_token });
    }

    public async me(req: Request, res: Response): Promise<Response> {
        const userId = req.user.id;
        const userRepository = new TypeOrmUserRepository();
        const getUserProfile = new GetUserProfile(userRepository);

        const user = await getUserProfile.execute({ userId });

        const userResponse = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId,
            jobTitle: user.jobTitle,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        };

        return res.json(userResponse);
    }
}
