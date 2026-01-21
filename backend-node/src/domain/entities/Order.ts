import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Restaurant } from './Restaurant';
import { OrderItem } from './OrderItem';
import { Waiter } from './Waiter';
import { Table } from './Table';
import { Customer } from './Customer';

export enum OrderStatus {
    WAITING = 'WAITING',
    PREPARING = 'PREPARING',
    READY = 'READY',
    DELIVERED = 'DELIVERED',
    FINISHED = 'FINISHED',
    CANCELED = 'CANCELED',
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 20 })
    code: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.WAITING,
    })
    status: OrderStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    // @Column({ type: 'varchar', precision: 10, scale: 2 })
    // customerName: string;

    @Column({ name: 'transaction_id', type: 'uuid', nullable: true, unique: true })
    transactionId: string | null;

    @Column({ name: 'temporary_customer_id', type: 'varchar', nullable: true })
    temporaryCustomerId: string | null;

    @Column({ name: 'total_decision_time', type: 'int', nullable: true })
    totalDecisionTime: number | null;

    @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer | null;

    @Column({ name: 'customer_id', type: 'uuid', nullable: true })
    customerId: string | null;

    @Column({ type: 'varchar', nullable: true })
    tableNumber: string | null;

    @ManyToOne(() => Table, (table) => table.orders, { nullable: true })
    @JoinColumn({ name: 'table_id' })
    table: Table | null;

    @Column({ name: 'table_id', type: 'uuid', nullable: true })
    tableId: string | null;

    @ManyToOne(() => Restaurant, { nullable: true })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @Column({ name: 'restaurant_id', type: 'uuid', nullable: true })
    restaurantId: string | null;

    @ManyToOne(() => Waiter, { nullable: true })
    @JoinColumn({ name: 'waiter_id' })
    waiter: Waiter;

    @Column({ name: 'waiter_id', type: 'uuid', nullable: true })
    waiterId: string | null;

    @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
    items: OrderItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
