import { IMenuRepository } from '@domain/repositories/IMenuRepository';
import { ICachePort } from '../ports/ICachePort';

export class ListCategoriesByRestaurantUseCase {
  constructor(
    private menuRepo: IMenuRepository,
    private cache: ICachePort,
  ) { }

  async execute(restaurantId: string) {
    const cacheKey = `menux:api:prod:restaurant:${restaurantId}:categories:v1`;

    const cachedCategories = await this.cache.get(cacheKey);
    if (cachedCategories) {
      return cachedCategories;
    }

    // Reuse the main query but maybe we want a lightweight one later
    const categories = await this.menuRepo.findAllCategoriesWithItems(restaurantId);

    // Minimal projection (just categories, no items)
    // Actually, findAllCategoriesWithItems fetches items too.
    // For optimization we would add a findAllCategoriesOnly method to repo.
    // For MVP, we map it out.
    const simpleCategories = categories.map((c) => ({
      id: c.id,
      name: c.name,
      order: c.order,
      pai: c.pai,
      description: '', // Category desc not in entity yet
    }));

    await this.cache.set(cacheKey, simpleCategories);

    return simpleCategories;
  }
}
