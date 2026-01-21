import 'reflect-metadata';
import { AppDataSource } from '../typeorm/data-source';
import { Restaurant } from '../../../domain/entities/Restaurant';

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('📦 Database initialized');

        const restaurantRepo = AppDataSource.getRepository(Restaurant);

        // 1. Get Default Restaurant
        const restaurant = await restaurantRepo.findOne({ where: { slug: 'menux-default' } });

        if (!restaurant) {
            console.error('❌ Default restaurant not found.');
            return;
        }

        const rId = restaurant.id;
        console.log(`Using restaurant: ${rId}`);

        // 2. RAW SQL Seeding

        // Waiter
        await AppDataSource.query(`
            INSERT INTO waiters (id, name, nickname, "pinCode", password, "restaurant_id", "createdAt", "updatedAt")
            VALUES (uuid_generate_v4(), 'João Silva', 'João', '1234', '1234', $1, now(), now())
            ON CONFLICT DO NOTHING
        `, [rId]);
        console.log('✅ Waiter ensured');

        const waiters = await AppDataSource.query('SELECT id FROM waiters LIMIT 1');
        const waiterId = waiters[0].id;

        // Tables
        for (let i = 1; i <= 20; i++) {
            await AppDataSource.query(`
                INSERT INTO tables (id, number, status, capacity, "restaurant_id", "createdAt", "updatedAt")
                VALUES (uuid_generate_v4(), $1, 'FREE', 4, $2, now(), now())
                ON CONFLICT DO NOTHING
            `, [i, rId]);
        }
        console.log('✅ Tables ensured');

        // Customers
        const customerData = [
            ['Ricardo Pamplona', 'ricardo@pamplona.com', '(11) 98765-4321', 'registered'],
            ['Maria Eduarda', 'maria.eduarda@email.com', '(11) 91234-5678', 'registered'],
            ['Cliente Anônimo 1', null, null, 'anonymous']
        ];

        for (const c of customerData) {
            await AppDataSource.query(`
                INSERT INTO customers (id, name, email, phone, "customer_type", "restaurant_id", "created_at", "updated_at")
                VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, now(), now())
                ON CONFLICT DO NOTHING
            `, [c[0], c[1], c[2], c[3], rId]);
        }
        console.log('✅ Customers ensured');

        // Orders
        const menuItems = await AppDataSource.query('SELECT id, price FROM menu_items LIMIT 10');
        const tables = await AppDataSource.query('SELECT id, number FROM tables LIMIT 10');
        const customers = await AppDataSource.query('SELECT id FROM customers LIMIT 3');

        if (menuItems.length > 0 && tables.length > 0) {
            for (let i = 0; i < 10; i++) {
                const orderId = uuidv4();
                const code = `ORD-${1000 + i}`;
                const customerId = customers[i % customers.length].id;
                const table = tables[i % tables.length];

                await AppDataSource.query(`
                    INSERT INTO orders (id, code, status, total, "customer_id", "table_id", "tableNumber", "restaurant_id", "waiter_id", "createdAt", "updatedAt")
                    VALUES ($1, $2, 'FINISHED', 0, $3, $4, $5, $6, $7, now(), now())
                `, [orderId, code, customerId, table.id, table.number.toString(), rId, waiterId]);

                let total = 0;
                for (let j = 0; j < 2; j++) {
                    const item = menuItems[Math.floor(Math.random() * menuItems.length)];
                    total += Number(item.price);
                    await AppDataSource.query(`
                        INSERT INTO order_items (id, quantity, price, "order_id", "menu_item_id")
                        VALUES (uuid_generate_v4(), 1, $1, $2, $3)
                    `, [item.price, orderId, item.id]);
                }
                await AppDataSource.query('UPDATE orders SET total = $1 WHERE id = $2', [total, orderId]);
            }
            console.log('✅ Orders and Items ensured');
        }

        console.log('🚀 RAW SQL Seeding completed successfully!');

    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

seed();
