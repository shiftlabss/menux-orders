
import { AppDataSource } from './src/infrastructure/database/typeorm/data-source';
import { TypeOrmOrderRepository } from './src/infrastructure/repositories/TypeOrmOrderRepository';

async function testOrders() {
    try {
        await AppDataSource.initialize();
        const repo = new TypeOrmOrderRepository();

        const restaurants = await AppDataSource.query('SELECT id FROM restaurants LIMIT 1');
        if (restaurants.length === 0) {
            console.log('No restaurants found');
            process.exit(0);
        }

        const restaurantId = restaurants[0].id;
        console.log('Testing orders for restaurantId:', restaurantId);

        const orders = await repo.listByRestaurant(restaurantId);
        console.log('Orders count:', orders.length);
        if (orders.length > 0) {
            console.log('First order:', JSON.stringify(orders[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('ORDERS ERROR:', error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

testOrders();
