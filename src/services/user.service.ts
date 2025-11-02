// services/user.service.ts
import pino from 'pino';
import type { User } from '../types/user.type';
import pool from '../../db.config';

const log = pino().child({ service: 'userService' });

type GetUserResult =
    | { status: 'not_found' }
    | { status: 'ok'; user: User };

type GetAllUsersResult =
    | { status: 'ok'; users: User[] }
    | { status: 'empty' }; 


export const getUser = async (userId: number): Promise<GetUserResult> => {
    log.info({ action: 'getUser', userId }, 'Obteniendo usuario por ID');

    try {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre_completo, correo, rol_id FROM usuario WHERE usuario_id = ?`,
            [userId]
        );

        const users = rows as User[];
        const user = users[0];

        if (!user) {
            log.warn({ userId }, 'Usuario no encontrado');
            return { status: 'not_found' };
        }

        log.info({ usuario_id: user.usuario_id }, 'Usuario obtenido correctamente');
        return { status: 'ok', user };
    } catch (err) {
        log.error({ err, userId }, 'Error al obtener usuario');
        throw err; 
    }
};

export const getAllUsers = async (): Promise<GetAllUsersResult> => {
    log.info({ action: 'getAllUsers' }, 'Obteniendo todos los usuarios');

    try {
        const [rows] = await pool.query(
            `SELECT usuario_id, nombre_completo, correo, rol_id FROM usuario`
        );

        const users = rows as User[];

        if (!users || users.length === 0) {
            log.warn('No se encontraron usuarios');
            return { status: 'empty' };
        }

        log.info({ count: users.length }, `Se obtuvieron ${users.length} usuarios`);
        return { status: 'ok', users };
    } catch (err) {
        log.error({ err }, 'Error al obtener todos los usuarios');
        throw err;
    }
};
