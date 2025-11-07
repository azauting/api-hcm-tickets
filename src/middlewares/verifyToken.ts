import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { sendResponse } from '../utils/helper';
import type { AuthRequest } from '../utils/interfaces';
import type { JWTPayload } from '../utils/interfaces';
import { logger } from '../utils/logger';

const log = logger.child({ middleware: 'verifyToken' });

const JWT_SECRET_RAW = process.env.JWT_SECRET;

if (!JWT_SECRET_RAW) {
    throw new Error('FATAL: JWT_SECRET no configurado');
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

export const verifyToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;
    // Verificar formato del token
    if (!authHeader?.startsWith('Bearer ')) {
        log.warn('Token de autenticación requerido');
        return sendResponse(res, 401, 'Token de autenticación requerido');
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return sendResponse(res, 401, 'Token de autenticación requerido');
    }

    try {
        const { payload } = (await jwtVerify(token, JWT_SECRET)) as { payload: JWTPayload };

        req.user = {
            id: payload.id,
            correo: payload.correo,
            tipo_rol: payload.tipo_rol,
            tipo_unidad: payload.tipo_unidad,
        };
        console.log(req.user);
        log.info({ correo: req.user.correo }, 'Token verificado correctamente');
        next();
    } catch (error) {
        log.warn({ error }, 'Token inválido o expirado');
        return sendResponse(res, 401, 'Token inválido o expirado');
    }
};

