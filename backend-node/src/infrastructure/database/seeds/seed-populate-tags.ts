import 'reflect-metadata';
import { AppDataSource } from '../typeorm/data-source';
import { MenuItem } from '../../../domain/entities/MenuItem';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Database initialized');

        const menuItemRepo = AppDataSource.getRepository(MenuItem);

        const items = await menuItemRepo.find();
        console.log(`Found ${items.length} items to update.`);

        for (const item of items) {
            let tags: string[] = [];

            // Simple heuristic to extract tags from description and name
            const textToAnalyze = `${item.name} ${item.description || ''} ${item.ingredients || ''}`.toLowerCase();

            const potentialTags = [
                // Proteins
                'frango', 'carne', 'peixe', 'camarão', 'queijo', 'bacon', 'calabresa', 'ovo', 'carne seca',
                // Types
                'hambúrguer', 'pizza', 'salada', 'massa', 'risoto', 'sobremesa', 'bebida', 'doce', 'salgado', 'frito', 'assado',
                // Features
                'vegano', 'vegetariano', 'sem glúten', 'picante', 'fitness', 'zero açúcar', 'integral',
                // Ingredients
                'tomate', 'alface', 'cebola', 'alho', 'arroz', 'feijão', 'batata', 'molho', 'chocolate', 'morango', 'limão'
            ];

            potentialTags.forEach(tag => {
                if (textToAnalyze.includes(tag)) {
                    tags.push(tag.charAt(0).toUpperCase() + tag.slice(1)); // Capitalize
                }
            });

            // Ensure unique tags
            tags = [...new Set(tags)];

            if (tags.length > 0) {
                item.tags = tags;
                await menuItemRepo.save(item);
                console.log(`Updated item "${item.name}" with tags: ${tags.join(', ')}`);
            }
        }

        console.log('✅ Tags population completed successfully!');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
