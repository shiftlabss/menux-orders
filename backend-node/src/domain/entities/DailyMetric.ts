import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { Restaurant } from './Restaurant';

@Entity('daily_metrics')
@Index(['restaurantId', 'date'], { unique: true })
export class DailyMetric {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Restaurant, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @Column({ name: 'restaurant_id', type: 'uuid' })
    restaurantId: string;

    @Column({ type: 'date' })
    date: string; // YYYY-MM-DD

    @Column({ name: 'total_orders', type: 'int', default: 0 })
    totalOrders: number;

    @Column({ name: 'total_revenue', type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalRevenue: number;

    @Column({ name: 'average_ticket', type: 'decimal', precision: 10, scale: 2, default: 0 })
    averageTicket: number;

    @Column({ name: 'average_decision_time', type: 'float', default: 0 })
    averageDecisionTime: number; // In seconds

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
