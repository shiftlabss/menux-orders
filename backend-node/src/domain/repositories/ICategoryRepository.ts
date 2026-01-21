import { Category } from '../entities/Category';

export interface ICategoryRepository {
    create(category: Category): Promise<Category>;
    save(category: Category): Promise<Category>;
    findById(id: string): Promise<Category | null>;
    findByRestaurantId(restaurantId: string, rootOnly?: boolean): Promise<Category[]>;
    findByParentId(parentId: string): Promise<Category[]>;
    delete(id: string): Promise<void>;
}
