import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Restaurant } from './Restaurant';
import { MenuItem } from './MenuItem';


@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus)
  restaurant: Restaurant;

  @Column()
  restaurantId: string;

  // This is a logical grouping, often menus have categories directly or via an intermediate table.
  // For simplicity, we'll assume a Category belongs to a Restaurant, and a Menu is just a view or configuration.
  // But based on user requirements "GetMenuByRestaurant", we might just need Categories linked to Restaurant.
  // Let's keep it simple: Menu might not be strictly needed as an Entity if we just list Categories,
  // but let's keep it for future-proofing "Lunch Menu", "Dinner Menu".

  @OneToMany(() => MenuItem, (item) => item.menu)
  items: MenuItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
