import type { Request, Response } from 'express';
import { InternalServerError, UserRetrievedOk, UserNotFound } from './apiResponse';
import { getUser } from '../services/user.service';


// Controlador para manejar la obtención de información del usuario por ID
export const getUserId = async (req: Request, res: Response) => {
    // obtenemos el ID del usuario desde los parámetros de la solicitud
    const userId = parseInt(req.params.id!);
    // intentamos obtener la información del usuario desde el servicio
    try {
        const user = await getUser(userId);
        // si no se encuentra el usuario, devolvemos una respuesta de usuario no encontrado
        if (user === undefined) {
            return res.json({ response: UserNotFound });
        }
        // si se encuentra el usuario, devolvemos una respuesta de éxito con la información del usuario
        return res.json({ response: UserRetrievedOk, data: user }); 
    } catch (error) {
        return res.json({ response: InternalServerError });
    }
}

// Controllar para manejar la obtención de todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
    res.send('PROXIMAMENTE: Obtener todos los usuarios');
}

// Controlador para manejar la actualización de la información del usuario por ID
export const updateUserPassword = async (req: Request, res: Response) => {
    res.send('PROXIMAMENTE: Actualizar contraseña del usuario por ID');
}

export const updateUserRole = async (req: Request, res: Response) => {
    res.send('PROXIMAMENTE: Actualizar rol del usuario por ID');
}