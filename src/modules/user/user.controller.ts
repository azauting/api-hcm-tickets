import type { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { userService } from './user.service';
import { parseIdParam, sendResponse } from '../../utils/helper';
import type { AuthRequest } from '../../utils/interfaces';

const log = logger.child({ ubicacion: 'userController' });

export const userController = {
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
    getUsers: async (req: Request, res: Response) => {
        try {
            log.info('Solicitando todos los usuarios');

            const result = await userService.getAllUsers();

            if (result.status === 'empty') {
                log.info('No se encontraron usuarios');
                return sendResponse(res, 200, 'No se encontraron usuarios', []);
            }

            // result.status === 'ok'
            const { users } = result;
            log.info({ count: users.length }, 'Usuarios obtenidos correctamente');
            return sendResponse(res, 200, 'Usuarios obtenidos correctamente', users);

        } catch (error) {
            log.error({ error }, 'Error interno al obtener usuarios');
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
    updateUserRole: async (req: AuthRequest, res: Response) => {
        try {
            log.info("Cambiando Rol")
            const userId = parseIdParam(req.params.id);
            // obtenemos la id del admin desde req.user.usuario_id
            const adminId = req.user!.id;
            // verificamos si de verdad es un administrador
            if (req.user!.nombre_rol !== 'administrador') {
                log.warn({ adminId }, 'Intento no autorizado de cambio de rol de usuario');
                return sendResponse(res, 403, 'No autorizado para cambiar roles de usuario');
            }
            // obtenemos el nuevo rol desde req.body.newRoleId
            const { newRoleId } = req.body;

            log.info({ adminId, userId, newRoleId }, 'Solicitando cambio de rol de usuario');

            const result = await userService.updateUserRole(newRoleId, userId, adminId,);
            if (result.status === 'not_found') {
                log.info({ userId }, 'Usuario no encontrado para cambio de rol');
                return sendResponse(res, 404, 'Usuario no encontrado');
            }

            // result.status === 'ok'
            log.info({ userId, newRoleId }, 'Rol de usuario actualizado correctamente');

            return sendResponse(res, 200, 'Rol de usuario actualizado correctamente');

        } catch (error) {
            log.error({ error }, 'Error interno al actualizar rol de usuario');
            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    updateUserUnit: async (req: AuthRequest, res: Response) => {
        try {
            const userId = parseIdParam(req.params.id);
            const adminId = req.user!.id;
            if (req.user!.nombre_rol !== 'administrador') {
                log.warn({ adminId }, 'Intento no autorizado de cambio de rol de usuario');
                return sendResponse(res, 403, 'No autorizado para cambiar roles de usuario');
            }
            const { newUnitId } = req.body;
            log.info({ adminId, userId, newUnitId }, 'Solicitando cambio de unidad de usuario');

            const result = await userService.updateUserUnit(adminId, userId, newUnitId);
            if (result.status === 'not_found') {
                log.info({ userId }, 'Usuario no encontrado para cambio de unidad');
                return sendResponse(res, 404, 'Usuario no encontrado');
            }
            // result.status === 'ok'   
            log.info({ userId, newUnitId }, 'Unidad de usuario actualizada correctamente');

            return sendResponse(res, 200, 'Unidad de usuario actualizada correctamente');

        } catch (error) {
            log.error({ error }, 'Error interno al actualizar unidad de usuario');

            return sendResponse(res, 500, 'Error interno del servidor');
        }
    },
    // Funciones futuras para actualizar contraseña pendiente
    updateUserPassword: async (req: AuthRequest, res: Response) => {
        try {
            const userId = parseIdParam(req.params.id);
            const adminId = req.user!.id;
            const { newPassword } = req.body;
            // verificamos el admin
            if (req.user!.nombre_rol !== 'administrador') {
                log.warn({ adminId }, 'Intento no autorizado de cambio de rol de usuario');
                return sendResponse(res, 403, 'No autorizado para cambiar contraseña de usuario');
            }
            
            log.info({ userId }, 'Solicitando cambio de contraseña de usuario');
            const result = await userService.updateUserPassword(userId, newPassword, adminId);
            if (result.status === 'not_found') {
                log.info({ userId }, 'Usuario no encontrado para cambio de contraseña');
                return sendResponse(res, 404, 'Usuario no encontrado');
            }
            // result.status === 'ok'          
            log.info({ userId }, 'Contraseña de usuario actualizada correctamente');
            return sendResponse(res, 200, 'Contraseña de usuario actualizada correctamente');

        } catch (error) {
            log.error({ error }, 'Error interno al actualizar contraseña de usuario');
            return sendResponse(res, 500, 'Error interno del servidor');
        };
    },
};








