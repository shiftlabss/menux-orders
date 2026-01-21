import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Restaurant } from './Restaurant';

@Entity('waiters')
export class Waiter {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', nullable: true })
    nickname: string | null;

    @Column({ type: 'varchar', nullable: true })
    avatarUrl: string | null;

    @Column({ length: 4 })
    pinCode: string;

    @Column({ type: 'varchar', nullable: true })
    password: string | null;

    @ManyToOne(() => Restaurant)
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @Column({ name: 'restaurant_id' })
    restaurantId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
