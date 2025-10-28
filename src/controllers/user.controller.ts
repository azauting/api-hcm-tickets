import type { Request, Response } from 'express';
import { 
    InternalServerError, 
    UserRetrievedOk, 
    UserNotFound, 
    UsersRetrievedOk 
} from './apiResponse';
import { getAllUsers, getUser } from '../services/user.service';

// Controller: obtener usuario por ID
export const getUserId = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id!, 10);
    if (Number.isNaN(userId)) {
        return res.status(400).json({ response: 'InvalidUserId', });
    }
    try {
        const user = await getUser(userId);
        if (!user) {
            return res.status(404).json({ response: UserNotFound });
        }
        return res.status(200).json({
            response: UserRetrievedOk,
            data: user
        });
    } catch (error) {
        return res.status(500).json({ response: InternalServerError });
    }
};

// Controller: obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await getAllUsers();
        if (!users || users.length === 0) {
            return res.status(404).json({ response: UserNotFound });
        }
        return res.status(200).json({
            response: UsersRetrievedOk,
            data: users
        });
    } catch (error) {
        return res.status(500).json({ response: InternalServerError });
    }
};


// Controlador para manejar la actualización de la información del usuario por ID
export const updateUserPassword = async (req: Request, res: Response) => {
    res.send('PROXIMAMENTE: Actualizar contraseña del usuario por ID');
}

export const updateUserRole = async (req: Request, res: Response) => {
    res.send('PROXIMAMENTE: Actualizar rol del usuario por ID');
}