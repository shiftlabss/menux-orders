import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Order } from './Order';
import { MenuItem } from './MenuItem';

@Entity('order_items')
export class OrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @Column({ name: 'order_id', type: 'uuid' })
    orderId: string;

    @ManyToOne(() => MenuItem)
    @JoinColumn({ name: 'menu_item_id' })
    menuItem: MenuItem;

    @Column({ name: 'menu_item_id', type: 'uuid' })
    menuItemId: string;

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    observation: string;

    @Column({ name: 'decision_time', type: 'int', nullable: true })
    decisionTime: number | null;

    @Column({ name: 'is_suggestion', type: 'boolean', default: false })
    isSuggestion: boolean;

    @Column({ name: 'suggestion_type', type: 'varchar', nullable: true })
    suggestionType: string | null;
}
