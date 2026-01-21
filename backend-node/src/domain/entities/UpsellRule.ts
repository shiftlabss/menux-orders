
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { MenuItem } from './MenuItem';
import { Restaurant } from './Restaurant';

@Entity('upsell_rules')
export class UpsellRule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'upsell_type', default: 'upsell' })
    upsellType: string;

    @Column({ name: 'trigger_product_id' })
    triggerProductId: string;

    @ManyToOne(() => MenuItem)
    @JoinColumn({ name: 'trigger_product_id' })
    triggerProduct: MenuItem;

    @Column({ name: 'upgrade_product_id' })
    upgradeProductId: string;

    @ManyToOne(() => MenuItem)
    @JoinColumn({ name: 'upgrade_product_id' })
    upgradeProduct: MenuItem;

    @ManyToOne(() => Restaurant, (restaurant) => restaurant.upsellRules)
    @JoinColumn({ name: 'restaurant_id' })
    restaurant: Restaurant;

    @Column({ name: 'restaurant_id' })
    restaurantId: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
