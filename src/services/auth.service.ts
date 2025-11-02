import pino from 'pino';
import type { User } from '../types/user.type';
import pool from '../../db.config';
import bcrypt from 'bcryptjs';

const log = pino().child({ service: 'authService' });

type Credentials = { correo: string; contrasena: string };

type VerifyResult =
    | { status: 'not_found' }
    | { status: 'invalid_password' }
    | { status: 'ok'; user: User };

export const verifyUserCredentials = async (credentials: Credentials): Promise<VerifyResult> => {
    log.info({ credentials: { correo: credentials.correo } }, 'Verificando credenciales');

    try {
        const [result] = await pool.query(
            `SELECT u.usuario_id, u.nombre_completo, u.correo, u.contrasena, u.rol_id, r.nombre_rol
                FROM usuario u
                INNER JOIN tipo_rol r ON u.rol_id = r.rol_id
            WHERE u.correo = ?`,
            [credentials.correo]
        );

        const user = (result as User[])[0];

        if (!user) {
            log.warn('Usuario no encontrado');
            return { status: 'not_found' };
        }

        const isPasswordValid = await bcrypt.compare(credentials.contrasena, user.contrasena);
        if (!isPasswordValid) {
            log.warn('Contraseña inválida');
            return { status: 'invalid_password' };
        }

        log.info('Credenciales verificadas correctamente');
        return { status: 'ok', user };
    } catch (err) {
        log.error({ err }, 'Error al verificar credenciales');
        throw err;
    }
};
