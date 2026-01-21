import { Request, Response } from 'express';
import { TypeOrmRestaurantRepository } from '@infrastructure/repositories/TypeOrmRestaurantRepository';
import { GetRestaurant } from '@application/use-cases/restaurant/GetRestaurant';
import { UpdateRestaurant } from '@application/use-cases/restaurant/UpdateRestaurant';
import { GetRestaurantBySlug } from '@application/use-cases/restaurant/GetRestaurantBySlug';
import { RedisCacheAdapter } from '@infrastructure/cache/redis/RedisCacheAdapter';

export class RestaurantsController {
    public show = async (req: Request, res: Response): Promise<Response> => {
        const restaurantId = req.user.restaurantId;

        const restaurantRepository = new TypeOrmRestaurantRepository();
        const getRestaurant = new GetRestaurant(restaurantRepository);

        const restaurant = await getRestaurant.execute(restaurantId);

        return res.json(restaurant);
    }

    public update = async (req: Request, res: Response): Promise<Response> => {
        const restaurantId = req.user.restaurantId;
        const data = req.body;

        const restaurantRepository = new TypeOrmRestaurantRepository();
        const cacheAdapter = new RedisCacheAdapter();
        const updateRestaurant = new UpdateRestaurant(restaurantRepository, cacheAdapter);

        const restaurant = await updateRestaurant.execute({
            id: restaurantId,
            ...data,
        });

        return res.json(restaurant);
    }

    public showBySlug = async (req: Request, res: Response): Promise<Response> => {
        const { slug } = req.params;

        const restaurantRepository = new TypeOrmRestaurantRepository();
        const cacheAdapter = new RedisCacheAdapter();
        const getRestaurantBySlug = new GetRestaurantBySlug(restaurantRepository, cacheAdapter);

        const restaurant = await getRestaurantBySlug.execute(slug);

        return res.json(restaurant);
    }
}
