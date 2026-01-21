import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { IEventBusPort } from '../ports/IEventBusPort';
import { Session } from '@domain/entities/Session';
import { ConflictError } from '@shared/errors';

interface StartSessionDTO {
  restaurantId: string;
  tableCode: string;
  customerName?: string;
}

export class StartSessionUseCase {
  constructor(
    private sessionRepo: ISessionRepository,
    private eventBus: IEventBusPort,
  ) {}

  async execute(dto: StartSessionDTO) {
    // 1. Check if there is already an active session for this table
    const activeSession = await this.sessionRepo.findActiveByTable(dto.restaurantId, dto.tableCode);
    if (activeSession) {
      // In a real world scenario, maybe we rejoin the session?
      // For this MVP rule, let's assume one session per table at a time
      throw new ConflictError('Table is already occupied');
    }

    // 2. Create Session
    const session = new Session();
    session.restaurantId = dto.restaurantId;
    session.tableCode = dto.tableCode;
    session.customerName = dto.customerName;
    session.isActive = true;

    // 3. Persist
    const savedSession = await this.sessionRepo.save(session);

    // 4. Publish Event
    await this.eventBus.publish('SessionStarted', {
      sessionId: savedSession.id,
      restaurantId: savedSession.restaurantId,
      tableCode: savedSession.tableCode,
      startedAt: savedSession.startedAt,
    });

    return savedSession;
  }
}
