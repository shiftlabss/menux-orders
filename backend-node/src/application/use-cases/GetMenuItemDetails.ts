import { IMenuRepository } from '@domain/repositories/IMenuRepository';
import { NotFoundError } from '@shared/errors';

export class GetMenuItemDetailsUseCase {
  constructor(private menuRepo: IMenuRepository) {}

  async execute(itemId: string) {
    const item = await this.menuRepo.findItemById(itemId);

    if (!item) {
      throw new NotFoundError('MenuItem');
    }

    return item;
  }
}
