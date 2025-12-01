import type { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { userService } from './user.service';
import { parseIdParam, sendResponse } from '../../utils/helper';
import type { AuthRequest } from '../../utils/interfaces';
import { act } from 'react';

const log = logger.child({ ubicacion: 'userController' });

export const userController = {
    createUser: async (req: AuthRequest, res: Response) => {
        try {
            log.info('Creando nuevo usuario');
            const adminId = req.user!.id;
            const { nombre_usuario, correo, contrasena, id_rol, id_unidad } = req.body;
            const activo = 1; // nuevo campo activo por defecto en 1
            const result = await userService.createUser(nombre_usuario, correo, contrasena, id_rol, id_unidad, activo);

            if (result.status === 'conflict') {
                log.info({ correo }, 'El correo ya está en uso');
                return sendResponse(res, 409, 'El correo ya está en uso');
            }

            // result.status === 'ok'
            const { newUserId } = result;
            log.info({ newUserId, nombre_usuario }, 'Usuario creado correctamente');
            return sendResponse(res, 201, 'Usuario creado correctamente', { usuario_id: newUserId });

        } catch (error) {
            log.error({ error }, 'Error interno al crear nuevo usuario');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getUserById: async (req: Request, res: Response) => {
        try {
            const userId = parseIdParam(req.params.id);
            log.info({ userId }, 'Solicitando usuario por ID');

            const result = await userService.getUser(userId);

            if (result.status === 'not_found') {
                log.info({ userId }, 'Usuario no encontrado');
                return sendResponse(res, 404, 'Usuario no encontrado');
            }

            const { user } = result;
            log.info({ usuario_id: user.usuario_id }, 'Usuario obtenido correctamente');
            return sendResponse(res, 200, 'Usuario obtenido correctamente', user);

        } catch (error) {
            log.error({ error }, 'Error interno al obtener usuario por ID');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getRequestingUsers: async (req: Request, res: Response) => {
        try {
            log.info('Solicitando usuarios con rol de solicitante');
            const result = await userService.getRequestingUsers();
            if (result.status === 'empty') {
                log.info('No se encontraron usuarios con rol de solicitante');
                return sendResponse(res, 200, 'No se encontraron usuarios con rol de solicitante', []);
            }
            // result.status === 'ok'
            const { users } = result;
            log.info({ count: users.length }, 'Usuarios con rol de solicitante obtenidos correctamente');
            return sendResponse(res, 200, 'Usuarios con rol de solicitante obtenidos correctamente', users);
        } catch (error) {
            log.error({ error }, 'Error interno al obtener usuarios con rol de solicitante');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getSupportUsers: async (req: Request, res: Response) => {
        try {
            log.info('Solicitando usuarios con rol de soporte');
            const result = await userService.getSupportUsers();
            if (result.status === 'empty') {
                log.info('No se encontraron usuarios con rol de soporte');
                return sendResponse(res, 200, 'No se encontraron usuarios con rol de soporte', []);
            }
            // result.status === 'ok'
            const { users } = result;
            log.info({ count: users.length }, 'Usuarios con rol de soporte obtenidos correctamente');
            return sendResponse(res, 200, 'Usuarios con rol de soporte obtenidos correctamente', users);
        } catch (error) {
            log.error({ error }, 'Error interno al obtener usuarios con rol de soporte');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    getAvailableSupports: async (req: Request, res: Response) => {
        try {
            log.info('Solicitando soportes disponibles para asignar tickets');

            const result = await userService.getAvailableSupports();

            if (result.status === 'empty') {
                log.info('No se encontraron soportes disponibles');
                return sendResponse(res, 200, 'No se encontraron soportes disponibles', []);
            }

            // result.status === 'ok'
            const { supports } = result;
            log.info({ count: supports.length }, 'Soportes disponibles obtenidos correctamente');
            return sendResponse(res, 200, 'Soportes disponibles obtenidos correctamente', supports);

        } catch (error) {
            log.error({ error }, 'Error interno al obtener soportes disponibles');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    updateUser: async (req: AuthRequest, res: Response) => {
        try {
            const userId = parseIdParam(req.params.id);
            log.info({ userId }, 'Actualizando usuario');

            // Campos opcionales
            const { contrasena, id_rol, id_unidad, activo } = req.body;

            const result = await userService.updateUser(userId, {
                contrasena,
                id_rol,
                id_unidad,
                activo
            });

            if (result.status === 'not_found') {
                return sendResponse(res, 404, 'Usuario no encontrado');
            }

            if (result.status === 'conflict') {
                return sendResponse(res, 409, 'El correo ya está en uso');
            }

            return sendResponse(res, 200, 'Usuario actualizado correctamente');

        } catch (error) {
            log.error({ error }, 'Error interno al actualizar usuario');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
};


