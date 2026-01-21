import 'reflect-metadata';
import { AppDataSource } from '../typeorm/data-source';
import { Restaurant } from '../../../domain/entities/Restaurant';
import { User } from '../../../domain/entities/User';
import { BCryptHashProvider } from '../../providers/BCryptHashProvider';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Database initialized');

        const restaurantRepo = AppDataSource.getRepository(Restaurant);
        const userRepo = AppDataSource.getRepository(User);
        const hashProvider = new BCryptHashProvider();

        // 1. Create Default Restaurant
        let restaurant = await restaurantRepo.findOne({ where: { slug: 'menux-default' } });

        if (!restaurant) {
            console.log('Creating default restaurant...');
            restaurant = restaurantRepo.create({
                name: 'Menux Default Restaurant',
                slug: 'menux-default',
                isActive: true,
            });
            await restaurantRepo.save(restaurant);
        } else {
            console.log('Restaurant already exists');
        }

        // 2. Create Admin User
        let admin = await userRepo.findOne({ where: { email: 'admin@admin.com' } });

        if (!admin) {
            console.log('Creating admin user...');
            const passwordHash = await hashProvider.generateHash('admin');

            admin = userRepo.create({
                name: 'Admin',
                email: 'admin@admin.com',
                passwordHash,
                role: 'admin',
                restaurant: restaurant,
                restaurantId: restaurant?.id
            });
            await userRepo.save(admin);
            console.log('✅ Admin user created: admin@admin.com / admin');
        } else {
            console.log('Admin user already exists');
        }

    } catch (err) {
        console.error('Error during seeding:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
