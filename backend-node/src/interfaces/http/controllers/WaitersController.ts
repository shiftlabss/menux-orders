import { Request, Response } from 'express';
import { TypeOrmWaiterRepository } from '@infrastructure/repositories/TypeOrmWaiterRepository';
import { CreateWaiter } from '@application/use-cases/waiter/CreateWaiter';
import { UpdateWaiter } from '@application/use-cases/waiter/UpdateWaiter';
import { DeleteWaiter } from '@application/use-cases/waiter/DeleteWaiter';
import { ListWaitersByRestaurant } from '@application/use-cases/waiter/ListWaitersByRestaurant';
import { GetWaiterDetails } from '@application/use-cases/waiter/GetWaiterDetails';

export class WaitersController {
    public create = async (req: Request, res: Response): Promise<Response> => {
        const { name, nickname, avatarUrl, pinCode, password } = req.body;
        const restaurantId = req.user.restaurantId;

        const waiterRepository = new TypeOrmWaiterRepository();
        const createWaiter = new CreateWaiter(waiterRepository);

        const waiter = await createWaiter.execute({
            name,
            nickname,
            avatarUrl,
            pinCode,
            password,
            restaurantId,
        });

        return res.status(201).json(waiter);
    }

    public update = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;
        const data = req.body;

        const waiterRepository = new TypeOrmWaiterRepository();
        const updateWaiter = new UpdateWaiter(waiterRepository);

        const waiter = await updateWaiter.execute({
            id,
            ...data,
        });

        return res.json(waiter);
    }

    public index = async (req: Request, res: Response): Promise<Response> => {
        const restaurantId = req.user.restaurantId;

        const waiterRepository = new TypeOrmWaiterRepository();
        const listWaiters = new ListWaitersByRestaurant(waiterRepository);

        const waiters = await listWaiters.execute(restaurantId);

        return res.json(waiters);
    }

    public show = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;

        const waiterRepository = new TypeOrmWaiterRepository();
        const getWaiter = new GetWaiterDetails(waiterRepository);

        const waiter = await getWaiter.execute(id);

        return res.json(waiter);
    }

    public delete = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;

        const waiterRepository = new TypeOrmWaiterRepository();
        const deleteWaiter = new DeleteWaiter(waiterRepository);

        await deleteWaiter.execute(id);

        return res.status(204).send();
    }
}
