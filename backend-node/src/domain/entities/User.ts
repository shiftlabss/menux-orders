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

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ default: 'user' })
    role: string;

    @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @Column({ name: 'restaurant_id', type: 'uuid', nullable: true })
    restaurantId: string;

    @Column({ nullable: true })
    jobTitle: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    avatarUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
