
import { AppDataSource } from './src/infrastructure/database/typeorm/data-source';

async function checkColumns() {
    try {
        await AppDataSource.initialize();
        const tables = ['customers', 'orders', 'tables', 'users', 'restaurants', 'waiters'];
        for (const table of tables) {
            const columns = await AppDataSource.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
                ORDER BY column_name
            `);
            console.log(`Table: ${table}`);
            console.log(JSON.stringify(columns, null, 2));
        }
        process.exit(0);
    } catch (error) {
        console.error('ERROR CHECKING COLUMNS:', error);
        process.exit(1);
    }
}

checkColumns();
