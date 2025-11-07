import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import type { GetUserResult, GetAllUsersResult } from '../../utils/types';
import type { User } from '../../utils/interfaces';
import type { RowDataPacket } from 'mysql2';

const log = logger.child({ ubicacion: 'userService' });

export const userService = {
    /* GetUser - Obtener un usuario por ID */
    async getUser(userId: number): Promise<GetUserResult> {
        log.info({ action: 'getUser', userId }, 'Obteniendo usuario por ID');
        try {
            const [rows] = await pool.query<User[] & RowDataPacket[]>(
                `
                SELECT usuario_id, nombre_completo, correo, rol_id, unidad_id 
                FROM usuario 
                WHERE usuario_id = ?
                `,
                [userId]
            );

            const user = rows[0];

            if (!user) {
                log.warn({ userId }, 'Usuario no encontrado');
                return { status: 'not_found' };
            }

            log.info({ usuario_id: user.usuario_id }, 'Usuario obtenido correctamente');
            return { status: 'ok', user };
        } catch (error) {
            log.error({ error, userId }, 'Error al obtener usuario por ID');
            throw error;
        }
    },
    /* GetAllUser - Obtener todos los usuarios */
    async getAllUsers(): Promise<GetAllUsersResult> {
        log.info({ action: 'getAllUsers' }, 'Obteniendo todos los usuarios');

        try {
            const [rows] = await pool.query<User[] & RowDataPacket[]>(
                `
        SELECT usuario_id, nombre_completo, correo, rol_id, unidad_id 
        FROM usuario
        `
            );

            if (rows.length === 0) {
                log.warn('No se encontraron usuarios');
                return { status: 'empty' };
            }

            log.info({ count: rows.length }, 'Usuarios obtenidos correctamente');
            return { status: 'ok', users: rows };
        } catch (error) {
            log.error({ error }, 'Error al obtener todos los usuarios');
            throw error;
        }
    },
};
