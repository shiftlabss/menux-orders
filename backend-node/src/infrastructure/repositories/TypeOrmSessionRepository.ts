import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { Session } from '@domain/entities/Session';
import { Repository } from 'typeorm';
import { AppDataSource } from '../database/typeorm/data-source';

export class TypeOrmSessionRepository implements ISessionRepository {
  private repo: Repository<Session>;

  constructor() {
    this.repo = AppDataSource.getRepository(Session);
  }

  async save(session: Session): Promise<Session> {
    return this.repo.save(session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.repo.findOneBy({ id });
  }

  async findActiveByTable(restaurantId: string, tableCode: string): Promise<Session | null> {
    return this.repo.findOne({
      where: {
        restaurantId,
        tableCode,
        isActive: true,
        endedAt: null as any, // TypeORM nullable check
      },
    });
  }
}
