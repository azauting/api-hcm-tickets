import express from 'express';
import { login } from './auth.controller';
import { verifyToken } from '../../middlewares/verifyToken';
import type { Response } from 'express';
import type { AuthRequest } from '../../utils/interfaces';
import { sendResponse } from '../../utils/helper';

const router = express.Router();

// Rutas de autenticación 
router.post('/login', login);

// Obtener información del usuario autenticado
router.get('/auth/me', verifyToken, (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return sendResponse(res, 401, 'No autenticado');
    }

    return sendResponse(res, 200, 'Usuario autenticado', {
        user: req.user,
    });
});

export default router;