import { SignJWT } from 'jose';
import type { UserWithRole } from '../types/user.type';

const JWT_SECRET_RAW = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
export const JWT_SECRET = JWT_SECRET_RAW ? new TextEncoder().encode(JWT_SECRET_RAW) : null;

export const createAuthToken = async (user: UserWithRole): Promise<string> => {
    if (!JWT_SECRET) {
        throw new Error('JWT secret no configurado en el servidor');
    }

    const payload = {
        id: user.usuario_id,
        correo: user.correo,
        role: user.nombre_rol,
    };

    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);
};