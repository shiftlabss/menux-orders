import { ICategoryRepository } from '@domain/repositories/ICategoryRepository';

export class ReorderCategories {
    constructor(private categoryRepository: ICategoryRepository) { }

    async execute(ids: string[]): Promise<void> {
        const promises = ids.map(async (id, index) => {
            const category = await this.categoryRepository.findById(id);
            if (category) {
                category.order = index;
                await this.categoryRepository.save(category);
            }
        });

        await Promise.all(promises);
    }
}
