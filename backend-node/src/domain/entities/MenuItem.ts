import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from './Category';

import { Menu } from './Menu';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  ingredients: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'simple-array', nullable: true })
  allergens: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Category, (category) => category.items)
  category: Category;

  @Column()
  categoryId: string;

  @ManyToOne(() => Menu, (menu) => menu.items, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menuId' })
  menu: Menu;

  @Column({ nullable: false })
  menuId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
