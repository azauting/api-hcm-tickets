import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../utils/interfaces';
import { sendResponse } from '../utils/helper';

export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Verificar autenticación
    if (!req.user) {
      return sendResponse(res, 401, 'No autorizado: usuario no autenticado');
    }

    //  Verificar permisos por rol
    if (!allowedRoles.includes(req.user.tipo_rol)) {
      return sendResponse(res, 403, 'Acceso prohibido: rol insuficiente');
    }
    // Permisos verificados, continuar
    next();
  };
};
