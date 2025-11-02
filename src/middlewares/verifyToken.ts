// middleware/verifyToken.ts
import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

const JWT_SECRET_RAW = process.env.JWT_SECRET;
const JWT_SECRET = JWT_SECRET_RAW ? new TextEncoder().encode(JWT_SECRET_RAW) : null;

if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET no configurado');// no lanzamos aquí para no romper imports, pero rutas protegidas deben devolver 500
}

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        correo: string;
        role: string;
    };
}

export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token de autenticación requerido' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Token de autenticación requerido' });
    }

    if (!JWT_SECRET) {
        // falla de configuración
        console.error('JWT_SECRET no configurado al verificar token');
        return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    try {
        // Ahora TypeScript sabe que token es string y JWT_SECRET no es null
        const { payload } = await jwtVerify(token, JWT_SECRET);

        req.user = {
            id: Number(payload.id),
            correo: String((payload as any).correo),
            role: String((payload as any).role),
        };

        next();
    } catch (error) {
        console.error('Error al verificar token:', error);
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};
