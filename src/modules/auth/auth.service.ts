import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import type { RowDataPacket } from 'mysql2';
import type { UserWithRole, JWTPayload } from '../../utils/interfaces';
import type { Credentials, VerifyResult } from '../../utils/types';

const log = logger.child({ service: 'authService' });

const JWT_SECRET_RAW = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h';
export const JWT_SECRET = JWT_SECRET_RAW ? new TextEncoder().encode(JWT_SECRET_RAW) : null;

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
                    u.correo,
                    u.contrasena,
                    r.nombre_rol AS tipo_rol,
                    tu.tipo_unidad AS tipo_unidad
                FROM usuario u
                INNER JOIN tipo_rol r ON u.rol_id = r.rol_id
                LEFT JOIN tipo_unidad tu ON u.unidad_id = tu.unidad_id
                WHERE u.correo = ?`, [credentials.correo]
            );


            const user = rows[0];
            console.log(user)
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
        if (!JWT_SECRET) {
            throw new Error('JWT secret no configurado en el servidor');
        }

        const payload: JWTPayload = {
            id: user.usuario_id,
            correo: user.correo,
            tipo_rol: user.tipo_rol,
            tipo_unidad: user.tipo_unidad ?? null,
        };

        return new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime(JWT_EXPIRES_IN)
            .sign(JWT_SECRET);
    },
};
