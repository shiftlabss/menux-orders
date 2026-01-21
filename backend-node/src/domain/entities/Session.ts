import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,

} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  restaurantId: string;

  @Column()
  tableCode: string;

  @Column({ nullable: true })
  customerName?: string;

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  endedAt: Date | null;

  @Column({ default: true })
  isActive: boolean;
}
