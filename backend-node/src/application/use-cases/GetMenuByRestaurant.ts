import { IMenuRepository } from '@domain/repositories/IMenuRepository';
import { ICachePort } from '../ports/ICachePort';
import { IEventBusPort } from '../ports/IEventBusPort';


export class GetMenuByRestaurantUseCase {
  constructor(
    private menuRepo: IMenuRepository,
    private cache: ICachePort,
    private eventBus: IEventBusPort,
  ) { }

  async execute(restaurantId: string, onlyActive = true) {
    const cacheKey = `menux:api:prod:restaurant:${restaurantId}:menu:v1${onlyActive ? ':active' : ':all'}`;

    // 1. Try Cache
    const cachedMenu = await this.cache.get(cacheKey);
    if (cachedMenu) {
      await this.eventBus.publish('MenuViewed', { restaurantId, source: 'cache' });
      return cachedMenu;
    }

    // 2. Query Repository
    const categories = await this.menuRepo.findAllCategoriesWithItems(restaurantId, onlyActive);

    // Publish Event regardless of result (attempt)
    await this.eventBus.publish('MenuViewed', { restaurantId, source: 'db' });

    if (!categories || categories.length === 0) {
      return [];
    }

    // 3. Save to Cache
    await this.cache.set(cacheKey, categories);

    return categories;
  }
}
