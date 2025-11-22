// src/middlewares/verifyToken.ts
import type { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { sendResponse } from '../utils/helper';
import type { AuthRequest } from '../utils/interfaces';
import type { JWTPayload } from '../utils/interfaces';
import { logger } from '../utils/logger';

const log = logger.child({ middleware: 'verifyToken' });

let cachedJwtKey: Uint8Array | null = null;

function getJwtSecret(): Uint8Array {
    // Si ya lo cacheamos, retorno eso
    if (cachedJwtKey) return cachedJwtKey;

    const raw = process.env.JWT_SECRET;
    if (!raw) {
        if (process.env.NODE_ENV === 'production') {
            // En producción no permitimos continuar sin secreto
            throw new Error('FATAL: JWT_SECRET no configurado');
        }
        // En desarrollo: usamos un secreto por defecto para no bloquear despliegues de pruebas.
        const dev = 'dev-temporal-no-usar-en-prod';
        log.warn('JWT_SECRET no encontrado — usando secreto de desarrollo (NO USAR EN PRODUCCIÓN)');
        cachedJwtKey = new TextEncoder().encode(dev);
        return cachedJwtKey;
    }

    cachedJwtKey = new TextEncoder().encode(raw);
    return cachedJwtKey;
}

export const verifyToken = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
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

        // Obtener secreto en runtime (puede lanzar en production si no existe)
        const JWT_SECRET = getJwtSecret();

        // Verificamos token
        const { payload } = (await jwtVerify(token, JWT_SECRET)) as { payload: JWTPayload };

        req.user = {
            id: payload.id,
            correo: payload.correo,
            tipo_rol: payload.tipo_rol,
            tipo_unidad: payload.tipo_unidad,
        };

        log.info({ correo: req.user.correo }, 'Token verificado correctamente');
        next();
    } catch (error) {
        log.warn({ error }, 'Token inválido o expirado / error verificación');
        return sendResponse(res, 401, 'Token inválido o expirado');
    }
};
