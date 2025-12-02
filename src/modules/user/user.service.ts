import { logger } from '../../utils/logger';
import pool from '../../config/db.config';
import type { GetUserResult, GetAllUsersResult, GetAllSupportsResult } from '../../utils/types';
import type { User } from '../../utils/interfaces';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import bcrypt from 'bcryptjs';

const log = logger.child({ ubicacion: 'userService' });

export const userService = {
    createUser: async (nombre_usuario: string, correo: string, contrasena: string, id_rol: number, id_unidad: number | null, activo: number): Promise<{ status: 'ok'; newUserId: number } | { status: 'conflict' }> => {
        log.info({ action: 'createUser', nombre_usuario, id_rol, id_unidad }, 'Creando nuevo usuario');
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
    /* GetRequestingUsers - Obtener todos los usuarios con rol de solicitante */
    getRequestingUsers: async (): Promise<GetAllUsersResult> => {
        log.info({ action: 'getRequestingUsers' }, 'Obteniendo usuarios con rol de solicitante');
        try {
            const [rows] = await pool.query<(User & RowDataPacket)[]>(
                `
                SELECT 
                    u.usuario_id,
                    u.nombre_completo,
                    u.correo,
                    r.nombre_rol,
                    activo
                FROM usuario u
                JOIN tipo_rol r ON r.rol_id = u.rol_id
                WHERE u.rol_id = 1
                `
            );
            if (rows.length === 0) {
                log.warn('No se encontraron usuarios con rol de solicitante');
                return { status: 'empty' };
            }
            log.info({ count: rows.length }, 'Usuarios con rol de solicitante obtenidos correctamente');
            return { status: 'ok', users: rows };
        } catch (error) {
            log.error({ error }, 'Error al obtener usuarios con rol de solicitante');
            throw error;
        }
    },
    /* GetSupportUsers - Obtener todos los usuarios con rol de soporte */
    getSupportUsers: async (): Promise<GetAllUsersResult> => {
        log.info({ action: 'getSupportUsers' }, 'Obteniendo usuarios con rol de soporte');
        try {
            const [rows] = await pool.query<(User & RowDataPacket)[]>(
                `
                SELECT 
                    u.usuario_id,
                    u.nombre_completo,
                    u.correo,
                    r.nombre_rol,
                    tu.unidad AS unidad,
                    u.activo
                FROM usuario u
                JOIN tipo_rol r ON r.rol_id = u.rol_id
                LEFT JOIN tipo_unidad tu ON tu.unidad_id = u.unidad_id
                WHERE u.rol_id = 2
                `
            );
            if (rows.length === 0) {
                log.warn('No se encontraron usuarios con rol de soporte');
                return { status: 'empty' };
            }
            log.info({ count: rows.length }, 'Usuarios con rol de soporte obtenidos correctamente');
            return { status: 'ok', users: rows };
        } catch (error) {
            log.error({ error }, 'Error al obtener usuarios con rol de soporte');
            throw error;
        }
    },
    updateUser: async (userId: number, data: any) => {
        log.info({ action: 'updateUser', userId, data });

        try {
            // 1. Verificar si existe el usuario
            const [rows] = await pool.query<RowDataPacket[]>(
                `SELECT usuario_id FROM usuario WHERE usuario_id = ?`,
                [userId]
            );

            if (rows.length === 0) {
                return { status: 'not_found' };
            }

            // 2. Construir dinámicamente los campos a actualizar
            const fieldsToUpdate: any = {};

            if (data.rol_id !== undefined) {
                fieldsToUpdate.rol_id = data.rol_id;
            }

            if (data.unidad_id !== undefined) {
                fieldsToUpdate.unidad_id = data.unidad_id;
            }

            if (data.activo !== undefined) {
                fieldsToUpdate.activo = data.activo;
            }

            if (data.contrasena !== undefined && typeof data.contrasena === 'string') {
                const hashed = await bcrypt.hash(data.contrasena, 10);
                fieldsToUpdate.contrasena = hashed;
            }

            // 3. Validación: si no hay nada que actualizar
            if (Object.keys(fieldsToUpdate).length === 0) {
                return { status: 'error', message: 'No hay campos válidos para actualizar' };
            }

            // 4. UPDATE dinámico
            const [result] = await pool.query<ResultSetHeader>(
                `UPDATE usuario SET ? WHERE usuario_id = ?`,
                [fieldsToUpdate, userId]
            );

            if (result.affectedRows === 0) {
                return { status: 'error', message: 'No se pudo actualizar el usuario' };
            }

            return { status: 'ok' };

        } catch (error) {
            log.error({ error, userId, data }, 'Error en updateUser');
            return { status: 'error', message: 'Error al actualizar usuario' };
        }
    },
};