
import { AppDataSource } from './src/infrastructure/database/typeorm/data-source';
import { Table } from './src/domain/entities/Table';

async function testTables() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(Table);

        const restaurants = await AppDataSource.query('SELECT id FROM restaurants LIMIT 1');
        if (restaurants.length === 0) {
            console.log('No restaurants found');
            process.exit(0);
        }

        const restaurantId = restaurants[0].id;
        console.log('Testing tables for restaurantId:', restaurantId);

        const tables = await repo.find({ where: { restaurantId } });
        console.log('Tables count:', tables.length);
        if (tables.length > 0) {
            console.log('First table:', JSON.stringify(tables[0], null, 2));
        }

        process.exit(0);
    } catch (error) {
        console.error('TABLES ERROR:', error);
        if (error.stack) console.error(error.stack);
        process.exit(1);
    }
}

testTables();
