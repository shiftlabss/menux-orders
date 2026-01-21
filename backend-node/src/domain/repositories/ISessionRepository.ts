import { Session } from '../entities/Session';

export interface ISessionRepository {
  save(session: Session): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findActiveByTable(restaurantId: string, tableCode: string): Promise<Session | null>;
}
