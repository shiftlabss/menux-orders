import { ISessionRepository } from '@domain/repositories/ISessionRepository';
import { IEventBusPort } from '../ports/IEventBusPort';
import { NotFoundError, DomainError } from '@shared/errors';

export class EndSessionUseCase {
  constructor(
    private sessionRepo: ISessionRepository,
    private eventBus: IEventBusPort,
  ) {}

  async execute(sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session');
    }

    if (!session.isActive) {
      throw new DomainError('Session is already ended');
    }

    session.isActive = false;
    session.endedAt = new Date();

    const savedSession = await this.sessionRepo.save(session);

    await this.eventBus.publish('SessionEnded', {
      sessionId: savedSession.id,
      endedAt: savedSession.endedAt,
      durationSeconds: (savedSession.endedAt!.getTime() - session.startedAt.getTime()) / 1000,
    });

    return savedSession;
  }
}
