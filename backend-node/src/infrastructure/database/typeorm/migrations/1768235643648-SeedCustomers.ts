import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from 'uuid';

export class SeedCustomers1768235643648 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Find a restaurant to link customers to
        const restaurants = await queryRunner.query('SELECT id FROM restaurants LIMIT 1');
        if (restaurants.length === 0) return;

        const restaurantId = restaurants[0].id;

        // Find some tables
        const tables = await queryRunner.query(`SELECT id, number FROM tables WHERE restaurant_id = '${restaurantId}' LIMIT 5`);

        const customer1Id = uuidv4();
        const customer2Id = uuidv4();

        // Insert Customers
        await queryRunner.query(`
            INSERT INTO customers (id, customer_type, name, email, phone, restaurant_id, origin, created_at, updated_at)
            VALUES 
            ('${customer1Id}', 'registered', 'Maria Eduarda de Albuquerque Cavalcanti Neto', 'maria.cavalcanti@email.com', '(11) 94301-3623', '${restaurantId}', NULL, '2025-08-05', '2025-08-05'),
            ('${customer2Id}', 'anonymous', 'Cliente Anônimo', NULL, NULL, '${restaurantId}', 'Mesa 12', '2025-12-20', '2025-12-20')
        `);

        // Insert more customers
        const moreNames = [
            { name: 'Bruno Silva', email: 'bruno.silva@email.com' },
            { name: 'Carla Santos', email: 'carla.santos@email.com' },
            { name: 'Daniel Oliveira', email: 'daniel.oliveira@email.com' },
        ];

        for (const c of moreNames) {
            await queryRunner.query(`
                INSERT INTO customers (id, customer_type, name, email, phone, restaurant_id, created_at, updated_at)
                VALUES ('${uuidv4()}', 'registered', '${c.name}', '${c.email}', '(11) 98888-8888', '${restaurantId}', now(), now())
            `);
        }

        // Find menu items through categories
        const menuItems = await queryRunner.query(`
            SELECT mi.id, mi.price 
            FROM menu_items mi
            INNER JOIN categories c ON c.id = mi."categoryId"
            WHERE c."restaurantId" = '${restaurantId}'
            LIMIT 10
        `);

        if (menuItems.length > 0 && tables.length > 0) {
            // Order for Customer 1
            const order1Id = uuidv4();
            await queryRunner.query(`
                INSERT INTO orders (id, code, status, total, customer_id, table_id, restaurant_id, "createdAt", "updatedAt")
                VALUES ('${order1Id}', 'ORD-101', 'FINISHED', 230.89, '${customer1Id}', '${tables[0].id}', '${restaurantId}', '2025-08-05', '2025-08-05')
            `);

            await queryRunner.query(`
                INSERT INTO order_items (id, order_id, menu_item_id, quantity, price)
                VALUES ('${uuidv4()}', '${order1Id}', '${menuItems[0].id}', 1, ${menuItems[0].price})
            `);

            // Order for Anonymous Customer
            const order2Id = uuidv4();
            await queryRunner.query(`
                INSERT INTO orders (id, code, status, total, customer_id, table_id, restaurant_id, "createdAt", "updatedAt")
                VALUES ('${order2Id}', 'ANON-0192', 'FINISHED', 185.90, '${customer2Id}', '${tables[1].id}', '${restaurantId}', '2025-12-20', '2025-12-20')
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DELETE FROM order_items');
        await queryRunner.query('DELETE FROM orders');
        await queryRunner.query('DELETE FROM customers');
    }
}
