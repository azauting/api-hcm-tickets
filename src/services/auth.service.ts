import pino from 'pino';
import type { User } from '../types/user.type';
import pool from '../../db.config';
import bcrypt from 'bcryptjs';

const log = pino().child({ service: 'authService' });

type VerifyResult =
    | { status: 'not_found' }
    | { status: 'invalid_password' }
    | { status: 'ok'; user: User };

export const verifyUserCredentials = async (credentials: { correo: string; contrasena: string; }): Promise<VerifyResult> => {
    const logger = log.child({ action: 'verifyUserCredentials' });
    logger.info('Verificando credenciales del usuario');

    try {
        const [result] = await pool.query('SELECT * FROM usuario WHERE correo = ?', [credentials.correo]);
        const users = result as User[];
        const user = users[0];

        if (!user) {
            logger.warn('Usuario no encontrado con el correo proporcionado');
            return { status: 'not_found' };
        }

        const isPasswordValid = await bcrypt.compare(credentials.contrasena, user.contrasena);
        if (!isPasswordValid) {
            logger.warn('Contraseña inválida para el usuario con el correo proporcionado');
            return { status: 'invalid_password' };
        }

        logger.info('Credenciales verificadas correctamente');
        return { status: 'ok', user };
    } catch (err) {
        logger.error({ err }, 'Error al verificar credenciales');
        // Propagar el error para que el controller devuelva 500
        throw err;
    }
};
