import { IMenuItemRepository } from '@domain/repositories/IMenuItemRepository';
import { AppError } from '@shared/errors';

export class DeleteMenuItem {
    constructor(private menuItemRepository: IMenuItemRepository) { }

    async execute(id: string): Promise<void> {
        const item = await this.menuItemRepository.findById(id);

        if (!item) {
            throw new AppError('Menu item not found', 404);
        }

        await this.menuItemRepository.delete(id);
    }
}
