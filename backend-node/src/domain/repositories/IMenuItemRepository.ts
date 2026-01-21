import { MenuItem } from '../entities/MenuItem';

export interface IMenuItemRepository {
    create(item: MenuItem): Promise<MenuItem>;
    save(item: MenuItem): Promise<MenuItem>;
    findById(id: string): Promise<MenuItem | null>;
    findByCategoryId(categoryId: string): Promise<MenuItem[]>;
    findByRestaurantId(restaurantId: string): Promise<MenuItem[]>;
    findByTags(tags: string[], restaurantId: string): Promise<MenuItem[]>;
    delete(id: string): Promise<void>;
}
