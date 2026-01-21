export interface ITokenProvider {
    generateToken(payload: any): string;
    verifyToken(token: string): any;
}
