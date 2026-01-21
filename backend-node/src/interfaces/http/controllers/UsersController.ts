import { Request, Response } from 'express';
import { CreateUser } from '@application/use-cases/user/CreateUser';
import { ListUsers } from '@application/use-cases/user/ListUsers';
import { ShowUser } from '@application/use-cases/user/ShowUser';
import { UpdateUser } from '@application/use-cases/user/UpdateUser';
import { DeleteUser } from '@application/use-cases/user/DeleteUser';
import { TypeOrmUserRepository } from '@infrastructure/repositories/TypeOrmUserRepository';
import { BCryptHashProvider } from '@infrastructure/providers/BCryptHashProvider';

export class UsersController {
    public async create(req: Request, res: Response): Promise<Response> {
        const { name, email, password, role, restaurantId, jobTitle, phone, avatarUrl } = req.body;

        const userRepository = new TypeOrmUserRepository();
        const hashProvider = new BCryptHashProvider();

        const createUser = new CreateUser(
            userRepository,
            hashProvider
        );

        const user = await createUser.execute({
            name,
            email,
            password,
            role,
            restaurantId,
            jobTitle,
            phone,
            avatarUrl,
        });

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

        return res.status(201).json(userResponse);
    }

    public async index(_req: Request, res: Response): Promise<Response> {
        const userRepository = new TypeOrmUserRepository();
        const listUsers = new ListUsers(userRepository);

        const users = await listUsers.execute();

        const usersResponse = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            restaurantId: user.restaurantId,
            jobTitle: user.jobTitle,
            phone: user.phone,
            avatarUrl: user.avatarUrl,
        }));

        return res.json(usersResponse);
    }

    public async show(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const userRepository = new TypeOrmUserRepository();
        const showUser = new ShowUser(userRepository);

        const user = await showUser.execute({ id });

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

    public async update(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const { name, email, password, role, restaurantId, jobTitle, phone, avatarUrl } = req.body;

        const userRepository = new TypeOrmUserRepository();
        const hashProvider = new BCryptHashProvider();
        const updateUser = new UpdateUser(userRepository, hashProvider);

        const user = await updateUser.execute({
            id,
            name,
            email,
            password,
            role,
            restaurantId,
            jobTitle,
            phone,
            avatarUrl,
        });

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

    public async delete(req: Request, res: Response): Promise<Response> {
        const { id } = req.params;
        const userRepository = new TypeOrmUserRepository();
        const deleteUser = new DeleteUser(userRepository);

        await deleteUser.execute({ id });

        return res.status(204).send();
    }
}
