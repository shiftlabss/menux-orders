import { Category } from '../entities/Category';
import { MenuItem } from '../entities/MenuItem';
import { Menu } from '../entities/Menu';

export interface IMenuRepository {
  /**
   * Finds all categories with their items for a specific restaurant.
   * Useful for building the full menu view.
   */
  findAllCategoriesWithItems(restaurantId: string, onlyActive?: boolean): Promise<Category[]>;

  /**
   * Finds a specific menu item by ID.
   */
  findItemById(itemId: string): Promise<MenuItem | null>;

  create(menu: Partial<Menu>): Promise<Menu>;
  findAll(restaurantId: string): Promise<Menu[]>;
  findById(id: string): Promise<Menu | null>;
  update(id: string, menu: Partial<Menu>): Promise<Menu>;
  delete(id: string): Promise<void>;
}
