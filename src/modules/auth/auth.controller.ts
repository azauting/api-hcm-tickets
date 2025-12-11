import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendResponse } from '../../utils/helper';
import { logger } from '../../utils/logger';

const log = logger.child({ ubicacion: 'authController' });

export const authController = {
    login: async (req: Request, res: Response) => {
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

            // Configuración de la cookie (ajusta maxAge según necesidad)
            const isProd = process.env.NODE_ENV === 'production';
            const cookieName = 'token';
            const cookieOptions = {
                httpOnly: true,
                secure: isProd, // true en producción (https); false en dev (http://localhost)
                sameSite: isProd ? 'none' as const : 'lax' as const,
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
            };

            // Enviar cookie + respuesta (NO enviamos token en el body por seguridad)
            res.cookie(cookieName, token, cookieOptions);

            return sendResponse(res, 200, 'Inicio de sesión exitoso', {
                user: userWithoutPassword
            });
        } catch (error) {
            log.error({ error }, 'Error en login');
            return sendResponse(
                res,
                500,
                'Error interno del servidor',
                error instanceof Error ? error.message : String(error)
            );
        }
    },
    createUser: async (req: Request, res: Response) => {
        const { nombre_completo, correo, contrasena, rol_id, unidad_id } = req.body;
        // Validación básica del body   
        if (!nombre_completo || !correo || !contrasena || !rol_id) {
            return sendResponse(res, 400, 'Nombre, correo, contraseña y rol son obligatorios');
        }


        try {
            const activo = 1;
            // Crear nuevo usuario
            const newUser = await AuthService.createUser({ nombre_completo, correo, contrasena, rol_id, unidad_id, activo });

            // Excluir contraseña antes de enviar la respuesta
            const { contrasena: _, ...userWithoutPassword } = newUser;

            return sendResponse(res, 201, 'Usuario creado exitosamente', {
                user: userWithoutPassword
            });
        } catch (error) {
            log.error({ error }, 'Error en createUser');
            return sendResponse(
                res,
                500,
                'Error interno del servidor',
                error instanceof Error ? error.message : String(error)
            );
        }
    }
};

