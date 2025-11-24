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
    if (cachedJwtKey) return cachedJwtKey;

    const raw = process.env.JWT_SECRET;
    if (!raw) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL: JWT_SECRET no configurado');
        }
        const dev = 'dev-temporal-no-usar-en-prod';
        log.warn('JWT_SECRET no encontrado — usando secreto de desarrollo (NO USAR EN PRODUCCIÓN)');
        cachedJwtKey = new TextEncoder().encode(dev);
        return cachedJwtKey;
    }

    cachedJwtKey = new TextEncoder().encode(raw);
    return cachedJwtKey;
}

/**
 * verifyToken middleware
 *
 * Acepta el token en:
 *  - Header Authorization: "Bearer <token>"
 *  - Cookie "token" o "refreshToken" (req.cookies.token || req.cookies.refreshToken)
 *
 * Requiere que el middleware cookie-parser (o equivalente) haya sido aplicado previamente:
 *   app.use(cookieParser());
 */
export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // 1) Intentar obtener token desde header Authorization
        const authHeader = req.headers.authorization;
        let token: string | undefined;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        // 2) Si no está en header, intentar obtener desde cookies
        if (!token && (req as Request & { cookies?: Record<string, any> }).cookies) {
            const cookies = (req as Request & { cookies?: Record<string, any> }).cookies!;
            token = cookies.token ?? cookies.refreshToken ?? undefined;
        }

        if (!token) {
            log.warn('Token de autenticación requerido (no encontrado en header ni cookie)');
            return sendResponse(res, 401, 'Token de autenticación requerido');
        }

        // 3) Obtener secreto y verificar token
        const JWT_SECRET = getJwtSecret(); // puede lanzar en production si no está

        const { payload } = (await jwtVerify(token, JWT_SECRET)) as { payload: JWTPayload };

        // 4) Adjuntar usuario al request (según payload)
        req.user = {
            id: payload.id,
            nombre_completo: payload.nombre_completo,
            correo: payload.correo,
            nombre_rol: payload.nombre_rol,
            unidad: payload.unidad,
        };

        log.info({ correo: req.user.correo }, 'Token verificado correctamente');
        return next();
    } catch (error) {
        log.warn({ error }, 'Token inválido o expirado / error verificación');
        return sendResponse(res, 401, 'Token inválido o expirado');
    }
};
