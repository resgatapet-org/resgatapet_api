import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

export interface TokenPayload {
    userId?: number;
    email: string;
    tipo: string;
}

export class AuthUtils {
    static generateToken(payload: TokenPayload): string {
        if (!JWT_SECRET) {
            throw new Error('A variável de ambiente JWT_SECRET é obrigatória e não está configurada no arquivo .env.');
        }
        return jwt.sign(
            payload as jwt.JwtPayload,
            JWT_SECRET as jwt.Secret,
            { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
        );
    }

    static verifyToken(token: string): TokenPayload {
        if (!JWT_SECRET) {
            throw new Error('A variável de ambiente JWT_SECRET é obrigatória e não está configurada no arquivo .env.');
        }
        try {
            return jwt.verify(token, JWT_SECRET as jwt.Secret) as TokenPayload;
        } catch (error) {
            throw new Error('Token inválido ou expirado');
        }
    }

    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    static async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}