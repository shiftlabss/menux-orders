import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Menu } from './Menu';
import { Category } from './Category';
import { UpsellRule } from './UpsellRule';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  cnpj: string;

  @Column({ nullable: true })
  tradingName: string;

  @Column({ nullable: true })
  corporateName: string;

  @Column({ type: 'text', nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  headerUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  openingHours: string;

  @Column({ nullable: true })
  instagram: string;

  @Column({ nullable: true })
  facebook: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column({ nullable: true })
  website: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Menu, (menu) => menu.restaurant)
  menus: Menu[];

  @OneToMany(() => Category, (category) => category.restaurant)
  categories: Category[];

  @OneToMany(() => UpsellRule, (upsellRule) => upsellRule.restaurant)
  upsellRules: UpsellRule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
