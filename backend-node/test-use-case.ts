
import { AppDataSource } from './src/infrastructure/database/typeorm/data-source';
import { TypeOrmCustomerRepository } from './src/infrastructure/repositories/TypeOrmCustomerRepository';
import { ListCustomersByRestaurant } from './src/application/use-cases/customer/ListCustomersByRestaurant';

async function testUseCase() {
    try {
        await AppDataSource.initialize();
        const repo = new TypeOrmCustomerRepository();
        const useCase = new ListCustomersByRestaurant(repo);

        // Find a restaurantId from the DB first
        const restaurants = await AppDataSource.query('SELECT id FROM restaurants LIMIT 1');
        if (restaurants.length === 0) {
            console.log('No restaurants found');
            process.exit(0);
        }

        const restaurantId = restaurants[0].id;
        console.log('Testing for restaurantId:', restaurantId);

        const result = await useCase.execute(restaurantId);
        console.log('Result count:', result.length);
        if (result.length > 0) {
            console.log('First entry:', JSON.stringify(result[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('USE CASE ERROR:', error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

testUseCase();
