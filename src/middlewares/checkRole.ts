import type { Request, Response, NextFunction } from "express";
import { Unauthorized, Forbidden } from "../controllers/apiResponse";

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        correo: string;
        role: string;
    };
}

/**
 * Middleware que verifica si el usuario tiene el rol permitido
 *  
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Si el usuario no está autenticado (req.user vacío)
    if (!req.user) {
        return res.status(Unauthorized.statusCode).json(Unauthorized);
    }

    const userRole = req.user.role;

    // Si el rol del usuario no está entre los permitidos
    if (!allowedRoles.includes(userRole)) {
        return res.status(Forbidden.statusCode).json({...Forbidden,
            detail: `El rol '${userRole}' no tiene permiso para acceder a este recurso.`,
    });
    }

    // Si pasa todas las validaciones, continúa
    next();
  };
};

