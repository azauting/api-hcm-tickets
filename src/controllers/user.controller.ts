// controllers/user.controller.ts
import type { Request, Response } from 'express';
import pino from 'pino';
import { getAllUsers, getUser } from '../services/user.service';

const logger = pino().child({ service: 'userController' });

export const getUserId = async (req: Request, res: Response) => {
    const idParam = req.params.id;
    const userId = Number.parseInt(idParam ?? '', 10);

    if (Number.isNaN(userId)) {
        logger.warn({ idParam }, 'ID de usuario inválido recibido');
        return res.status(400).json({ message: 'InvalidUserId' });
    }

    try {
        logger.info({ userId }, 'Solicitando usuario por ID');
        const result = await getUser(userId);

        if (result.status === 'not_found') {
            logger.info({ userId }, 'Usuario no encontrado');
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // result.status === 'ok'
        const { user } = result;
        logger.info({ usuario_id: user.usuario_id }, 'Usuario obtenido correctamente');
        return res.status(200).json({
            message: 'Usuario obtenido correctamente',
            data: user,
        });
    } catch (err) {
        logger.error({ err, userId }, 'Error interno al obtener usuario por ID');
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        logger.info('Solicitando todos los usuarios');
        const result = await getAllUsers();

        if (result.status === 'empty') {
            logger.info('No se encontraron usuarios');
            return res.status(200).json({
                message: 'No se encontraron usuarios',
                data: [],
            });
        }
        // result.status === 'ok'
        const { users } = result;
        logger.info({ count: users.length }, 'Usuarios obtenidos correctamente');
        return res.status(200).json({
            message: 'Usuarios obtenidos correctamente',
            data: users,
        });
    } catch (err) {
        logger.error({ err }, 'Error interno al obtener usuarios');
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const updateUserPassword = async (req: Request, res: Response) => {
    return res.status(501).json({ message: 'PROXIMAMENTE: Actualizar contraseña del usuario por ID' });
};

export const updateUserRole = async (req: Request, res: Response) => {
    return res.status(501).json({ message: 'PROXIMAMENTE: Actualizar rol del usuario por ID' });
};
