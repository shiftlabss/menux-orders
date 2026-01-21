import 'reflect-metadata';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../typeorm/data-source';
import { Restaurant } from '../../../domain/entities/Restaurant';
import { Category } from '../../../domain/entities/Category';
import { MenuItem } from '../../../domain/entities/MenuItem';
import { Menu } from '../../../domain/entities/Menu';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Database initialized');

        const restaurantRepo = AppDataSource.getRepository(Restaurant);
        const categoryRepo = AppDataSource.getRepository(Category);
        const itemRepo = AppDataSource.getRepository(MenuItem);
        const menuRepo = AppDataSource.getRepository(Menu);

        // 1. Get Default Restaurant
        const restaurant = await restaurantRepo.findOne({ where: { slug: 'menux-default' } });

        if (!restaurant) {
            console.error('❌ Default restaurant not found. Please run initial seed first.');
            return;
        }

        console.log(`Using restaurant: ${restaurant.name} (${restaurant.id})`);

        // 2. Create Menus
        let mainMenu = await menuRepo.findOne({ where: { name: 'Cardápio Principal' } });
        if (!mainMenu) {
            mainMenu = menuRepo.create({
                name: 'Cardápio Principal',
                description: 'Nosso menu principal com todas as opções.',
                isActive: true,
                restaurantId: restaurant.id
            });
            await menuRepo.save(mainMenu);
            console.log('✅ Main Menu created');
        }

        // 3. Helper to create Category
        const createCategory = async (name: string, order: number, pai: string | null = null) => {
            const whereClause: any = { name, restaurantId: restaurant.id };
            if (pai) {
                whereClause.pai = pai;
            } else {
                whereClause.pai = IsNull();
            }

            let cat = await categoryRepo.findOne({ where: whereClause });
            if (!cat) {
                cat = categoryRepo.create({
                    name,
                    order,
                    restaurantId: restaurant.id,
                    pai: pai || null,
                    isActive: true
                });
                await categoryRepo.save(cat);
                console.log(`✅ Category created: ${name}`);
            }
            return cat;
        };

        // 4. Helper to create MenuItem
        const createItem = async (name: string, description: string, price: number, categoryId: string) => {
            let item = await itemRepo.findOne({ where: { name, categoryId } });
            if (!item) {
                item = itemRepo.create({
                    name,
                    description,
                    price,
                    categoryId,
                    isActive: true,
                    allergens: []
                });
                await itemRepo.save(item);
                console.log(`   🔸 Item created: ${name}`);
            }
            return item;
        };

        // --- POPULATING DATA ---

        // BEBIDAS
        const catBebidas = await createCategory('Bebidas', 1);
        const catVinhos = await createCategory('Vinhos', 1, catBebidas.id);
        const catCervejas = await createCategory('Cervejas', 2, catBebidas.id);
        const catSucos = await createCategory('Sucos Naturais', 3, catBebidas.id);

        await createItem('Vinho Concha el Toro Cabernet Sauvignon', 'Vinho tinto seco 750ml', 89.90, catVinhos.id);
        await createItem('Vinho Casillero del Diablo Malbec', 'Vinho tinto reserva 750ml', 110.00, catVinhos.id);
        await createItem('Cerveja Artesanal IPA', '600ml de puro lúpulo', 24.50, catCervejas.id);
        await createItem('Suco de Laranja', 'Copo 300ml 100% natural', 12.00, catSucos.id);

        // PRATOS
        const catPratos = await createCategory('Pratos', 2);
        const catMassas = await createCategory('Massas', 1, catPratos.id);
        const catCarnes = await createCategory('Carnes', 2, catPratos.id);

        await createItem('Talharim a Bolonhesa', 'Massa fresca com molho especial de carne', 45.00, catMassas.id);
        await createItem('Lasanha de Presunto e Queijo', 'Camadas deliciosas com molho branco e vermelho', 52.00, catMassas.id);
        await createItem('Picanha na Chapa', '500g de picanha com acompanhamentos', 120.00, catCarnes.id);
        await createItem('Filé Mignon ao Molho Madeira', 'Acompanha arroz e batatas', 85.00, catCarnes.id);

        // SOBREMESAS
        const catSobremesas = await createCategory('Sobremesas', 3);
        const catDoces = await createCategory('Doces', 1, catSobremesas.id);
        const catFrutas = await createCategory('Frutas', 2, catSobremesas.id);

        await createItem('Musse de Maracujá', 'Cremoso e refrescante com calda de sementes', 18.00, catDoces.id);
        await createItem('Petit Gâteau', 'Com sorvete de baunilha e calda quente', 28.00, catDoces.id);
        await createItem('Salada de Frutas', 'Frutas da estação selecionadas', 15.00, catFrutas.id);

        console.log('🚀 Seeding completed successfully!');

    } catch (err) {
        console.error('Error during seeding:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
