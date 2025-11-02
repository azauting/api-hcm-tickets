import type { Request, Response, NextFunction } from "express";


interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        correo: string;
        role: string;
    };
}

export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Si el usuario no está autenticado (req.user vacío)
    if (!req.user) {
        return res.status(401).json({ response: "No autorizado" });
    }

    const userRole = req.user.role;

    // Si el rol del usuario no está entre los permitidos
    if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ response: "Acceso prohibido: rol insuficiente" });
    };
    // Si pasa todas las validaciones, continúa
    next();
  };
};

