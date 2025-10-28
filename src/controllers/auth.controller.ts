import type { Request, Response } from 'express';
import { verifyUserCredentials } from '../services/auth.service';
import { SignJWT } from 'jose';

import type { UserWithRole } from '../types/user.type';

const JWT_SECRET_RAW = process.env.JWT_SECRET;
const JWT_SECRET = JWT_SECRET_RAW ? new TextEncoder().encode(JWT_SECRET_RAW) : null;
const JWT_EXPIRES_IN = '1h';

if (!JWT_SECRET) {
    // No lanzar en tiempo de import si prefieres, pero es útil detectar configuración faltante pronto.
    console.error('FATAL: JWT_SECRET no está definido en las variables de entorno');
}

// Función para crear un token de autenticación
export const createAuthToken = async (user: UserWithRole): Promise<string> => {
    if (!JWT_SECRET) throw new Error('JWT secret no configurado');

    const payload = {
        id: user.usuario_id,
        correo: user.correo,
        role: user.nombre_rol
    };

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(JWT_EXPIRES_IN)
        .sign(JWT_SECRET);

    return token;
};

// Controller auth login 
export const login = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    if (!correo.endsWith('@hospital.cl')) {
        return res.status(400).json({ message: 'El correo es inválido' });
    }

    try {
        const result = await verifyUserCredentials({ correo, contrasena });

        if (result.status === 'not_found') {
            // Si prefieres seguridad, puedes responder 401 sin distinguir; aquí se diferencia explícitamente.
            return res.status(404).json({ message: 'Correo no registrado' });
        }

        if (result.status === 'invalid_password') {
            return res.status(401).json({ message: 'Contraseña inválida' });
        }

        // result.status === 'ok'
        const user = result.user as UserWithRole;

        const token = await createAuthToken(user);

        // Establecemos headers explícitos (aunque Express ya pone Content-Type)
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Authorization', `Bearer ${token}`);

        // Guardamos el token como cookie (opcional)
        res.cookie('auth_token', token, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true,
            maxAge: 60 * 60 * 1000,
        });

        const { contrasena: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            message: 'Inicio de sesión exitoso',
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Error en login:', error);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
