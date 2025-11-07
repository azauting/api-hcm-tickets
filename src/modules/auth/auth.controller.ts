import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendResponse } from '../../utils/helper';

export const login = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;

    // Validación básica del body
    if (!correo || !contrasena) {
        return sendResponse(res, 400, 'Correo y contraseña son obligatorios');
    }

    try {
        // Verificar credenciales
        const result = await AuthService.verifyUserCredentials({ correo, contrasena });

        if (result.status === 'not_found') {
            return sendResponse(res, 404, 'Correo no registrado');
        }

        if (result.status === 'invalid_password') {
            return sendResponse(res, 401, 'Contraseña inválida');
        }

        // Usuario autenticado
        const user = result.user;
        const token = await AuthService.createAuthToken(user);

        // Excluir contraseña antes de enviar la respuesta
        const { contrasena: _, ...userWithoutPassword } = user;

        return sendResponse(res, 200, 'Inicio de sesión exitoso', {
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        console.error('Error en login:', error);

        return sendResponse(
            res,
            500,
            'Error interno del servidor',
            error instanceof Error ? error.message : String(error)
        );
    }
};
