import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { StartSessionUseCase } from '@application/use-cases/StartSession';
import { EndSessionUseCase } from '@application/use-cases/EndSession';

export class SessionController {
  constructor(
    private startSessionUseCase: StartSessionUseCase,
    private endSessionUseCase: EndSessionUseCase,
  ) {}

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        restaurantId: z.string().uuid(),
        tableCode: z.string().min(1),
        customerName: z.string().optional(),
      });

      const dto = bodySchema.parse(req.body);

      const session = await this.startSessionUseCase.execute(dto);

      res.status(201).json({ data: session });
    } catch (error) {
      next(error);
    }
  }

  async end(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        sessionId: z.string().uuid(),
      });

      // Accepting sessionId from body or maybe params, prompt said POST /end
      // Usually POST to /sessions/end would imply body
      const { sessionId } = bodySchema.parse(req.body);

      const session = await this.endSessionUseCase.execute(sessionId);

      res.json({ data: session });
    } catch (error) {
      next(error);
    }
  }
}
