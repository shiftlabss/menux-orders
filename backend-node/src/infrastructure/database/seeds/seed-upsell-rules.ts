import 'reflect-metadata';
import { AppDataSource } from '../typeorm/data-source';
import { Restaurant } from '../../../domain/entities/Restaurant';
import { MenuItem } from '../../../domain/entities/MenuItem';
import { UpsellRule } from '../../../domain/entities/UpsellRule';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Database initialized');

        const restaurantRepo = AppDataSource.getRepository(Restaurant);
        const itemRepo = AppDataSource.getRepository(MenuItem);
        const upsellRepo = AppDataSource.getRepository(UpsellRule);

        // 1. Get Default Restaurant
        const restaurant = await restaurantRepo.findOne({ where: { slug: 'menux-default' } });

        if (!restaurant) {
            console.error('❌ Default restaurant not found. Please run initial seed first.');
            return;
        }

        console.log(`Using restaurant: ${restaurant.name} (${restaurant.id})`);

        // 2. Clear existing Upsell Rules for clean slate (optional, but good for idempotent seed)
        // Note: Using delete instead of clear to respect foreign keys if cascading isn't perfect, 
        // though strictly clearing by restaurant would be safer if we supported multi-tenant seeding here.
        // For now, let's just create if not exists or ignore duplicates if we check logic.
        // But to ensure fresh rules as per user request "add data", let's try to find existing items.

        // 3. Find Items
        // Fetch all items to debug, filtering in memory if needed or just trusting the small DB
        const items = await itemRepo.find();
        console.log(`Found ${items.length} total items.`);
        items.forEach(i => console.log(` - ${i.name}`));

        // If we strictly need restaurant filtering (which we do if multi-tenant real env), 
        // we can filter in JS if the complex ORM query is failing silently
        // const items = await itemRepo.find({ where: { menu: { restaurant: { id: restaurant.id } } } });

        const findItemByName = (name: string) => items.find(i => i.name === name);

        const vinhoConcha = findItemByName('Cabernet Sauvignon'); // Was: Vinho Concha...
        const picanha = findItemByName('Picanha na Chapa');
        const cerveja = findItemByName('IPA Artesanal'); // Was: Cerveja Artesanal IPA
        const petitGateau = findItemByName('Petit Gâteau');
        const talharim = findItemByName('Talharim Bolonhesa'); // Was: Talharim a Bolonhesa


        const rulesToCreate = [];

        // UPSELL: Talharim -> Picanha (Upgrade de Prato)
        if (talharim && picanha) {
            rulesToCreate.push({
                name: 'Upgrade para Picanha',
                upsellType: 'upsell',
                triggerProductId: talharim.id,
                upgradeProductId: picanha.id,
                restaurantId: restaurant.id,
                isActive: true
            });
        }

        // CROSS-SELL: Picanha -> Cerveja
        if (picanha && cerveja) {
            rulesToCreate.push({
                name: 'Cerveja com Picanha',
                upsellType: 'cross-sell',
                triggerProductId: picanha.id,
                upgradeProductId: cerveja.id,
                restaurantId: restaurant.id,
                isActive: true
            });
        }

        // CROSS-SELL: Picanha -> Petit Gateau (Sobremesa)
        if (picanha && petitGateau) {
            rulesToCreate.push({
                name: 'Sobremesa após Jantar',
                upsellType: 'cross-sell',
                triggerProductId: picanha.id,
                upgradeProductId: petitGateau.id,
                restaurantId: restaurant.id,
                isActive: true
            });
        }

        // CROSS-SELL: Talharim -> Vinho
        if (talharim && vinhoConcha) {
            rulesToCreate.push({
                name: 'Vinho com Massa',
                upsellType: 'cross-sell',
                triggerProductId: talharim.id,
                upgradeProductId: vinhoConcha.id,
                restaurantId: restaurant.id,
                isActive: true
            });
        }


        // 4. Persist Rules
        for (const ruleData of rulesToCreate) {
            // Check if rule exists to prevent duplicates
            const existing = await upsellRepo.findOne({
                where: {
                    triggerProductId: ruleData.triggerProductId,
                    upgradeProductId: ruleData.upgradeProductId,
                    restaurantId: ruleData.restaurantId
                }
            });

            if (!existing) {
                const rule = upsellRepo.create(ruleData);
                await upsellRepo.save(rule);
                console.log(`✅ Rule created: ${ruleData.name} (${ruleData.upsellType})`);
            } else {
                console.log(`⚠️ Rule already exists: ${ruleData.name}`);
            }
        }

        console.log('🚀 Upsell Rules Seeding completed successfully!');

    } catch (err) {
        console.error('Error during seeding:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
