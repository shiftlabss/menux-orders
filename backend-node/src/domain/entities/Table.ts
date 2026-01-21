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
import { Waiter } from './Waiter';
import { Order } from './Order';

export enum TableStatus {
    FREE = 'FREE',
    OCCUPIED = 'OCCUPIED',
    CLOSING = 'CLOSING',
    CLOSED = 'CLOSED',
}

export enum TablePriority {
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

@Entity('tables')
export class Table {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'integer' })
    number: number;

    @Column({
        type: 'enum',
        enum: TableStatus,
        default: TableStatus.FREE,
    })
    status: TableStatus;

    @Column({
        type: 'enum',
        enum: TablePriority,
        nullable: true,
    })
    priority: TablePriority | null;

    @Column({ type: 'integer', default: 0 })
    capacity: number;

    @Column({ type: 'integer', default: 0 })
    currentPeople: number;

    @Column({ type: 'timestamp', nullable: true })
    openedAt: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    closedAt: Date | null;



    @ManyToOne(() => Restaurant)
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @Column({ name: 'restaurant_id', type: 'uuid' })
    restaurantId: string;

    @ManyToOne(() => Waiter, { nullable: true })
    @JoinColumn({ name: 'waiter_id' })
    waiter: Waiter | null;

    @Column({ name: 'waiter_id', type: 'uuid', nullable: true })
    waiterId: string | null;

    @OneToMany(() => Order, (order) => order.table)
    orders: Order[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
