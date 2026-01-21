import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('analytics_events')
export class AnalyticsEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string;

    @Column({ type: 'timestamp' })
    timestamp: Date;

    @Column({ name: 'session_id' })
    sessionId: string;

    @Column({ name: 'item_id', nullable: true })
    itemId?: string;

    @Column({ nullable: true })
    context?: string;

    @Column({ nullable: true })
    name?: string;

    @Column({ nullable: true })
    price?: string;

    @Column({ name: 'item_count', nullable: true })
    itemCount?: number;

    @Column({ name: 'total_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
    totalValue?: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
