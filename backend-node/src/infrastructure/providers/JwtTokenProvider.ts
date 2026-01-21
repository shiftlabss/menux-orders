import { sign, verify } from 'jsonwebtoken';
import { ITokenProvider } from '@domain/providers/ITokenProvider';
import { config } from '@shared/config';

export class JwtTokenProvider implements ITokenProvider {
    public generateToken(payload: any): string {
        return sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn as any,
        });
    }

    public verifyToken(token: string): any {
        return verify(token, config.jwt.secret);
    }
}
