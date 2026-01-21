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
import { MenuItem } from './MenuItem';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int', default: 0 })
  order: number; // For sorting

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  pai: string | null;

  @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'pai' })
  parentCategory: Category;

  @OneToMany(() => Category, (category) => category.parentCategory)
  subcategories: Category[];

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.categories)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column()
  restaurantId: string;

  @OneToMany(() => MenuItem, (item) => item.category)
  items: MenuItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
