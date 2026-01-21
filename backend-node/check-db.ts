
import { AppDataSource } from './src/infrastructure/database/typeorm/data-source';
import { Customer } from './src/domain/entities/Customer';

async function checkDB() {
    try {
        await AppDataSource.initialize();
        const customerRepo = AppDataSource.getRepository(Customer);
        const customers = await customerRepo.find();
        console.log('Customer count:', customers.length);
        if (customers.length > 0) {
            console.log('First customer:', JSON.stringify(customers[0], null, 2));
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking DB:', error);
        process.exit(1);
    }
}

checkDB();
