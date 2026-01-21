import { Request, Response } from 'express';
import { TypeOrmCategoryRepository } from '@infrastructure/repositories/TypeOrmCategoryRepository';
import { CreateCategory } from '@application/use-cases/category/CreateCategory';
import { UpdateCategory } from '@application/use-cases/category/UpdateCategory';
import { DeleteCategory } from '@application/use-cases/category/DeleteCategory';
import { ReorderCategories } from '@application/use-cases/category/ReorderCategories';
import { RedisCacheAdapter } from '@infrastructure/cache/redis/RedisCacheAdapter';

export class CategoriesController {
    private invalidateMenuCache = async (restaurantId: string): Promise<void> => {
        const cache = new RedisCacheAdapter();
        await cache.del(`menux:api:prod:restaurant:${restaurantId}:menu:v1:active`);
        await cache.del(`menux:api:prod:restaurant:${restaurantId}:menu:v1:all`);
    }

    public create = async (req: Request, res: Response): Promise<Response> => {
        const { name, order, isActive, restaurantId, pai } = req.body;

        const categoryRepository = new TypeOrmCategoryRepository();
        const createCategory = new CreateCategory(categoryRepository);

        const category = await createCategory.execute({
            name,
            order,
            isActive,
            restaurantId: restaurantId || req.user?.restaurantId,
            pai,
        });

        await this.invalidateMenuCache(category.restaurantId);

        return res.status(201).json(category);
    }

    public update = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;
        const { name, order, isActive, pai } = req.body;

        const categoryRepository = new TypeOrmCategoryRepository();
        const updateCategory = new UpdateCategory(categoryRepository);

        const category = await updateCategory.execute({
            id,
            name,
            order,
            isActive,
            pai,
        });

        await this.invalidateMenuCache(category.restaurantId);

        return res.json(category);
    }

    public index = async (req: Request, res: Response): Promise<Response> => {
        const restaurantId = req.query.restaurantId as string || req.user?.restaurantId;
        const pai = req.query.pai as string;
        const system = req.query.system === 'true';

        const categoryRepository = new TypeOrmCategoryRepository();

        let categories;
        if (system) {
            const allCategories = await categoryRepository.findByRestaurantId(restaurantId);
            const pizzas = allCategories.find(c => c.name.toLowerCase().includes('pizza'));
            const wines = allCategories.find(c => c.name.toLowerCase().includes('vinho') || c.name.toLowerCase().includes('wine'));

            return res.json({
                pizzas_id: pizzas?.id,
                wines_id: wines?.id
            });
        }

        if (pai) {
            categories = await categoryRepository.findByParentId(pai);
        } else {
            categories = await categoryRepository.findByRestaurantId(restaurantId, true);
        }

        const mappedCategories = categories.map(cat => ({
            ...cat,
            is_active: cat.isActive
        }));

        return res.json(mappedCategories);
    }

    public show = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;

        const categoryRepository = new TypeOrmCategoryRepository();
        const category = await categoryRepository.findById(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        return res.json(category);
    }

    public delete = async (req: Request, res: Response): Promise<Response> => {
        const { id } = req.params;

        const categoryRepository = new TypeOrmCategoryRepository();
        const deleteCategory = new DeleteCategory(categoryRepository);

        await deleteCategory.execute(id);

        const restaurantId = req.user?.restaurantId;
        if (restaurantId) await this.invalidateMenuCache(restaurantId);

        return res.status(204).send();
    }

    public reorder = async (req: Request, res: Response): Promise<Response> => {
        const { ids } = req.body;

        const categoryRepository = new TypeOrmCategoryRepository();
        const reorderCategories = new ReorderCategories(categoryRepository);

        await reorderCategories.execute(ids);

        const restaurantId = req.user?.restaurantId;
        if (restaurantId) await this.invalidateMenuCache(restaurantId);

        return res.status(204).send();
    }
}
