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
import { Order } from './Order';

export enum CustomerType {
    REGISTERED = 'registered',
    ANONYMOUS = 'anonymous',
}

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        name: 'customer_type',
        type: 'enum',
        enum: CustomerType,
        default: CustomerType.REGISTERED,
    })
    customerType: CustomerType;

    @Column({ type: 'varchar' })
    name: string;

    @Column({ type: 'varchar', nullable: true })
    email: string | null;

    @Column({ type: 'varchar', nullable: true })
    phone: string | null;

    @Column({ name: 'anon_id', type: 'varchar', nullable: true })
    anonId: string | null;

    @Column({ type: 'varchar', nullable: true })
    origin: string | null;

    @ManyToOne(() => Restaurant)
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @Column({ name: 'restaurant_id', type: 'uuid' })
    restaurantId: string;

    @OneToMany(() => Order, (order) => order.customer)
    orders: Order[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
