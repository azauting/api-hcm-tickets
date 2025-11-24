import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import type { RowDataPacket } from 'mysql2';
import type { UserWithRole, JWTPayload } from '../../utils/interfaces';
import type { Credentials, VerifyResult } from '../../utils/types';

const log = logger.child({ ubicacion: 'authService' });

/**
 * Helper seguro para obtener el secreto JWT en runtime.
 * - Lanza error en production si no está configurado.
 * - En entornos no-production devuelve null (o puedes devolver un secreto dev opcional).
 */
function getJwtSecret(): Uint8Array | null {
    const raw = process.env.JWT_SECRET;
    if (!raw && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET no configurado en el servidor (production)');
    }
    // Si estás en dev y no existe, retornamos null y el caller decide (o puedes devolver un secreto dev)
    return raw ? new TextEncoder().encode(raw) : null;
}

/**
 * TTL por defecto si no se pasa JWT_EXPIRES_IN en env.
 * Puede ser '1h', '24h', o segundos en string, jose acepta ambos.
 */
function getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN ?? '24h';
}

export const AuthService = {
    /**
     * Verifica las credenciales del usuario
     */
    async verifyUserCredentials(credentials: Credentials): Promise<VerifyResult> {
        log.info({ correo: credentials.correo }, 'Verificando credenciales');

        try {
            const [rows] = await pool.query<(UserWithRole & RowDataPacket)[]>(
                `SELECT 
            u.usuario_id,
            u.nombre_completo,
            u.contrasena,
            u.correo,
            r.nombre_rol AS nombre_rol,
            tu.unidad AS unidad
        FROM usuario u
        INNER JOIN tipo_rol r ON u.rol_id = r.rol_id
        LEFT JOIN tipo_unidad tu ON u.unidad_id = tu.unidad_id
        WHERE u.correo = ?`, [credentials.correo]
            );

            const user = rows[0];
            if (!user) {
                log.warn({ correo: credentials.correo }, 'Usuario no encontrado');
                return { status: 'not_found' };
            }

            const isPasswordValid = await bcrypt.compare(credentials.contrasena, user.contrasena);
            if (!isPasswordValid) {
                log.warn({ correo: credentials.correo }, 'Contraseña inválida');
                return { status: 'invalid_password' };
            }

            log.info({ usuario_id: user.usuario_id }, 'Credenciales válidas');
            return { status: 'ok', user };
        } catch (error) {
            log.error({ error }, 'Error al verificar credenciales');
            throw error;
        }
    },

    /**
     * Genera un token de autenticación JWT
     */
    async createAuthToken(user: UserWithRole): Promise<string> {
        const JWT_SECRET = getJwtSecret();
        if (!JWT_SECRET) {
            // En dev: puedes permitir un secreto por defecto (menos seguro), o preferir fallar.
            if (process.env.NODE_ENV === 'production') {
                throw new Error('JWT secret no configurado en el servidor (production)');
            } else {
                // opcional: use a dev secret to continue working in development
                const devSecret = 'dev-temporal-no-usar-en-prod';
                log.warn('Usando JWT secret de desarrollo (no usar en producción)');
                return new SignJWT({
                    id: user.usuario_id,
                    nombre_completo: user.nombre_completo,
                    correo: user.correo,
                    tipo_rol: user.nombre_rol,
                    tipo_unidad: user.unidad ?? null,
                })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setExpirationTime(getJwtExpiresIn())
                    .sign(new TextEncoder().encode(devSecret));
            }
        }

        const payload: JWTPayload = {
            id: user.usuario_id,
            nombre_completo: user.nombre_completo,
            correo: user.correo,
            nombre_rol: user.nombre_rol,
            unidad: user.unidad ?? null,
        };

        return new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(getJwtExpiresIn())
            .sign(JWT_SECRET);
    },
};
