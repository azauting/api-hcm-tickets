import type { Request, Response } from 'express';
import { logger } from '../../utils/logger';
import { userService } from './user.service';
import { parseIdParam, sendResponse } from '../../utils/helper';
/* 
Controlladores para la gestión de usuarios:
- getUserById: Obtiene un usuario por su ID.
- getUsers: Obtiene todos los usuarios.
- updateUserPassword: Actualiza la contraseña de un usuario (próximamente).
- updateUserRole: Actualiza el rol de un usuario (próximamente).
*/

const log = logger.child({ ubicacion: 'userController' });

// Obtener un usuario por ID
export const getUserById = async (req: Request, res: Response) => {
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
};
// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
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
};

// Funciones futuras para actualizar contraseña y rol de usuario
export const updateUserPassword = async (req: Request, res: Response) => {
    // Implementar lógica para actualizar la contraseña del usuario
    return sendResponse(res, 501, 'Funcionalidad no implementada aún');
};

export const updateUserRole = async (req: Request, res: Response) => {
    // Implementar lógica para actualizar el rol del usuario
    return sendResponse(res, 501, 'Funcionalidad no implementada aún');
};
