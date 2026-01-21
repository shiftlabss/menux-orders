import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetMenuByRestaurantUseCase } from '@application/use-cases/GetMenuByRestaurant';
import { ListCategoriesByRestaurantUseCase } from '@application/use-cases/ListCategoriesByRestaurant';
import { GetMenuItemDetailsUseCase } from '@application/use-cases/GetMenuItemDetails';
import { ICachePort } from '@application/ports/ICachePort';

export class MenuController {
  constructor(
    private getMenuUseCase: GetMenuByRestaurantUseCase,
    private listCategoriesUseCase: ListCategoriesByRestaurantUseCase,
    private getItemUseCase: GetMenuItemDetailsUseCase,
    private cache: ICachePort,
  ) { }

  public getMenu = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const paramsSchema = z.object({
        restaurantId: z.string().uuid(),
      });

      const { restaurantId } = paramsSchema.parse(req.params);

      const menu = await this.getMenuUseCase.execute(restaurantId);
      return res.json({ data: menu });
    } catch (error) {
      return next(error);
    }
  }

  public getFullMenu = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const restaurantId = req.user?.restaurantId || req.query.restaurantId;
      console.log(req.user)

      if (!restaurantId) {
        return res.status(400).json({ message: 'Restaurant ID is required' });
      }

      const menu = await this.getMenuUseCase.execute(restaurantId as string, false);

      // Map to frontend format (isActive -> is_active)
      const mappedMenu = (menu as any[]).map((cat: any) => ({
        ...cat,
        is_active: cat.isActive,
        subcategories: cat.subcategories?.map((sub: any) => ({
          ...sub,
          is_active: sub.isActive,
          items: sub.items?.map((item: any) => ({
            ...item,
            is_active: item.isActive
          }))
        }))
      }));

      return res.json(mappedMenu);
    } catch (error) {
      return next(error);
    }
  }

  public getHighlights = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const restaurantId = req.user?.restaurantId || req.query.restaurantId;


      if (!restaurantId) {

        return res.status(400).json({ message: 'Restaurant ID is required' });
      }

      const cacheKey = `menux:restaurant:${restaurantId}:highlights`;
      const highlights = await this.cache.get(cacheKey);

      return res.json(highlights || []);
    } catch (error) {
      return next(error);
    }
  }

  public getHighlightsPublic = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const restaurantId = req.query.restaurantId;


      if (!restaurantId) {

        return res.status(400).json({ message: 'Restaurant ID is required' });
      }

      const cacheKey = `menux:restaurant:${restaurantId}:highlights`;
      const highlights = await this.cache.get(cacheKey);

      return res.json(highlights || []);
    } catch (error) {
      return next(error);
    }
  }

  public updateHighlights = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const restaurantId = req.user?.restaurantId;
      const { products } = req.body;

      if (!restaurantId) {
        return res.status(400).json({ message: 'Restaurant ID is required' });
      }

      const cacheKey = `menux:restaurant:${restaurantId}:highlights`;

      // Persist highlights in Redis (No TTL, permanent for the restaurant)
      await this.cache.set(cacheKey, products, 0);

      // Also invalidate public menu caches since highlights changed
      await this.invalidateMenuCache(restaurantId);

      return res.json({ success: true, data: products });
    } catch (error) {
      return next(error);
    }
  }

  private async invalidateMenuCache(restaurantId: string): Promise<void> {
    await this.cache.del(`menux:api:prod:restaurant:${restaurantId}:menu:v1:active`);
    await this.cache.del(`menux:api:prod:restaurant:${restaurantId}:menu:v1:all`);
  }

  public listCategories = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const paramsSchema = z.object({
        restaurantId: z.string().uuid(),
      });
      const { restaurantId } = paramsSchema.parse(req.params);

      const categories = await this.listCategoriesUseCase.execute(restaurantId);
      return res.json({ data: categories });
    } catch (error) {
      return next(error);
    }
  }

  public getItem = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = paramsSchema.parse(req.params);

      const item = await this.getItemUseCase.execute(id);
      return res.json({ data: item });
    } catch (error) {
      return next(error);
    }
  }
}
