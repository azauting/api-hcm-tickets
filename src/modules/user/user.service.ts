import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import type { GetUserResult, GetAllUsersResult, GetAllSupportsResult } from '../../utils/types';
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
    /* GetAvailableSupports - Obtener soportes disponibles para asignar tickets */
    async getAvailableSupports(): Promise<GetAllSupportsResult> {
        log.info({ action: 'getAvailableSupports' }, 'Obteniendo soportes disponibles para asignar tickets');

        try {
            // Mostrar todos los usuarios con el rol soporte que no tengan un ticket asignado en estado 'en proceso' (estado_id = 2) pero debemos mostrar TODOS los soportes disponibles
            // para ver si esta asignado a un ticket, es revisar el ticket detalle y ver si tiene un ticket en estado 'en proceso', para eso hay que ver la tabla ticket y filtrar por estado_id = 2
            // tabla 

            const [rows] = await pool.query<User[] & RowDataPacket[]>(
                `
                SELECT 
                    u.usuario_id,
                    u.nombre_completo,
                    u.correo,
                    u.rol_id,
                    u.unidad_id
                        FROM usuario u
                        JOIN tipo_rol tr ON tr.rol_id = u.rol_id
                        WHERE tr.nombre_rol = 'soporte'
                        AND NOT EXISTS (
                            SELECT 1
                            FROM ticket_detalle td
                            JOIN ticket t       ON t.ticket_id    = td.ticket_id
                            JOIN tipo_estado te ON te.estado_id   = t.estado_id
                            WHERE td.soporte_asignado = u.usuario_id
                            AND te.estado = 'en proceso'
                        );
                `
            );


            if (rows.length === 0) {
                log.warn('No se encontraron soportes disponibles');
                return { status: 'empty' };
            }

            log.info({ count: rows.length }, 'Soportes disponibles obtenidos correctamente');
            return { status: 'ok', supports: rows };
        } catch (error) {
            log.error({ error }, 'Error al obtener soportes disponibles');
            throw error;
        }
    }
};

