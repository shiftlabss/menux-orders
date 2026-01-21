import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { config } from '@shared/config';
import { AppError } from '@shared/errors';

interface ITokenPayload {
    iat: number;
    exp: number;
    sub: string;
    restaurantId: string;
}

export function ensureAuthenticated(
    request: Request,
    _response: Response,
    next: NextFunction,
): void {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        throw new AppError('JWT token is missing', 401);
    }

    // format: "Bearer <token>"
    const [, token] = authHeader.split(' ');

    try {
        const decoded = verify(token, config.jwt.secret);
        const { sub, restaurantId } = decoded as ITokenPayload;

        request.user = {
            id: sub,
            restaurantId,
        };

        return next();
    } catch {
        throw new AppError('Invalid JWT token', 401);
    }
}
