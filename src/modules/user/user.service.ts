import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import type { GetUserResult, GetAllUsersResult, GetAllSupportsResult } from '../../utils/types';
import type { User } from '../../utils/interfaces';
import type { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';

const log = logger.child({ ubicacion: 'userService' });

export const userService = {
    createUser: async (nombre_usuario: string, correo:string, contrasena: string, id_rol: number, id_unidad: number | null, activo: number): Promise<{ status: 'ok'; newUserId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createUser', nombre_usuario, id_rol, id_unidad}, 'Creando nuevo usuario');
        try {
            // Verificar si el nombre de usuario ya existe
            const [existingUsers] = await pool.query<RowDataPacket[]>(
                'SELECT usuario_id FROM usuario WHERE correo = ?',
                [correo]
            );
            if (existingUsers.length > 0) {
                log.warn({ correo }, 'El correo ya está en uso');
                return { status: 'conflict' };
            }
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            
            const [result] = await pool.query<RowDataPacket[]>(
                `
                INSERT INTO usuario (nombre_completo, correo, contrasena, rol_id, unidad_id, activo)
                VALUES (?, ?, ?, ?, ?, ?)
                `,
                [nombre_usuario, correo, hashedPassword, id_rol, id_unidad, activo]
            );
            
            const newUserId = (result as any).insertId;
            log.info({ newUserId, nombre_usuario }, 'Usuario creado correctamente');
            return { status: 'ok', newUserId };
        } catch (error) {
            log.error({ error, nombre_usuario }, 'Error al crear nuevo usuario');
            throw error;
        }
    },
    /* GetUser - Obtener un usuario por ID */
    getUser: async (userId: number): Promise<GetUserResult> => {
        log.info({ action: 'getUser', userId }, 'Obteniendo usuario por ID');
        try {
            // obtener el string de rol y unidad
            const [rows] = await pool.query<User[] & RowDataPacket[]>(
                `
                SELECT 
                    u.usuario_id,
                    u.nombre_completo,
                    u.correo,
                    u.rol_id,
                    u.unidad_id,
                    tr.nombre_rol,
                    u.activo,
                    un.unidad AS nombre_unidad
                FROM usuario u
                JOIN tipo_rol tr 
                    ON tr.rol_id = u.rol_id
                LEFT JOIN tipo_unidad un 
                    ON u.unidad_id = un.unidad_id
                WHERE u.usuario_id = ?
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
    getAllUsers: async (): Promise<GetAllUsersResult> => {
        log.info({ action: 'getAllUsers' }, 'Obteniendo todos los usuarios');

        try {
            // obtener los strings, no los id del rol y unidad
            const [rows] = await pool.query<User[] & RowDataPacket[]>(
                `
                SELECT 
                    u.usuario_id,
                u.nombre_completo,
                u.correo,
                u.rol_id,
                u.unidad_id,
                tr.nombre_rol,
                un.unidad AS nombre_unidad,
                u.activo
                FROM usuario u
                JOIN tipo_rol tr 
                    ON tr.rol_id = u.rol_id
                LEFT JOIN tipo_unidad un 
                    ON u.unidad_id = un.unidad_id
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
    updateUserRole: async (newRoleId: number, userId: number, adminId: number): Promise<{ status: 'ok' | 'not_found' | 'error' }> => {
        log.info({ action: 'updateUserRole', userId, newRoleId, adminId }, 'Actualizando rol de usuario');
        try {
            const [result] = await pool.query<RowDataPacket[]>(
                `
                UPDATE usuario
                SET rol_id = ?
                WHERE usuario_id = ?
                    `,
                [newRoleId, userId]
            );

            const affectedRows = (result as any).affectedRows;

            if (affectedRows === 0) {
                log.warn({ userId }, 'Usuario no encontrado para actualizar rol');
                return { status: 'not_found' };
            }
            

            log.info({ usuario_id: userId, nuevo_rol_id: newRoleId }, 'Rol de usuario actualizado correctamente');
            return { status: 'ok' };
        } catch (error) {
            log.error({ error, userId }, 'Error al actualizar rol de usuario');
            return { status: 'error' };
        }
    },
    updateUserUnit: async (adminId: number, userId: number, newUnitId: number): Promise<{ status: 'ok' | 'not_found' | 'error' }> => {
        log.info({ action: 'updateUserUnit', userId, newUnitId, adminId }, 'Actualizando unidad de usuario');
        try {
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                UPDATE usuario
                SET unidad_id = ?
                WHERE usuario_id = ?
                    `,
                [newUnitId, userId]
            );

            const affectedRows = (rows as any).affectedRows;

            if (affectedRows === 0) {
                log.warn({ userId }, 'Usuario no encontrado para actualizar unidad');
                return { status: 'not_found' };
            }

            log.info({ usuario_id: userId, nueva_unidad_id: newUnitId }, 'Unidad de usuario actualizada correctamente');
            return { status: 'ok' };
        } catch (error) {
            log.error({ error, userId }, 'Error al actualizar unidad de usuario');
            return { status: 'error' };
        }
    },
    updateUserPassword: async (userId: number, newPassword: string, adminId: number): Promise<{ status: 'ok' | 'not_found' | 'error' }> => {
        log.info({ action: 'updateUserPassword', userId, adminId }, 'Actualizando contraseña de usuario');
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [rows] = await pool.query<RowDataPacket[]>(
                `
                UPDATE usuario
                SET contrasena = ?
                WHERE usuario_id = ?
                    `,
                [hashedPassword, userId]
            );

            const affectedRows = (rows as any).affectedRows;

            if (affectedRows === 0) {
                log.warn({ userId }, 'Usuario no encontrado para actualizar contraseña');
                return { status: 'not_found' };
            }

            log.info({ usuario_id: userId }, 'Contraseña de usuario actualizada correctamente');
            return { status: 'ok' };
        } catch (error) {
            log.error({ error, userId }, 'Error al actualizar contraseña de usuario');
            return { status: 'error' };
        }
    },
    /* GetAvailableSupports - Obtener soportes disponibles para asignar tickets */
    async getAvailableSupports(): Promise<GetAllSupportsResult> {
        log.info({ action: 'getAvailableSupports' }, 'Obteniendo soportes disponibles para asignar tickets');
        try {
            const [rows] = await pool.query<(User & RowDataPacket)[]>(
                `
                SELECT 
                    u.usuario_id,
                u.nombre_completo,
                u.correo,
                u.rol_id,
                u.unidad_id,
                un.unidad AS nombre_unidad
                FROM usuario u
                JOIN tipo_rol tr 
                    ON tr.rol_id = u.rol_id
                LEFT JOIN tipo_unidad un 
                    ON u.unidad_id = un.unidad_id
                WHERE tr.nombre_rol = 'soporte'
                    AND NOT EXISTS(
                    SELECT 1
                        FROM ticket_detalle td
                        JOIN ticket t       ON t.ticket_id = td.ticket_id
                        JOIN tipo_estado te ON te.estado_id = t.estado_id
                        WHERE td.soporte_asignado = u.usuario_id
                        AND te.estado = 'en proceso'
                );`
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