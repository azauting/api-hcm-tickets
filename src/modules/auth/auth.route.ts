import express from 'express';
import { authController } from './auth.controller';
import { verifyToken } from '../../middlewares/verifyToken';
import type { Response } from 'express';
import type { AuthRequest } from '../../utils/interfaces';
import { sendResponse } from '../../utils/helper';
import { checkRole } from '../../middlewares/checkRole';

const router = express.Router();

// inicio de sesion
router.post('/login', authController.login);
// crear nuevo usuario (solo admin)
router.post('/new-user', verifyToken, checkRole(['administrador']), authController.createUser);
// obtener datos del usuario autenticado
router.get('/auth/me', verifyToken, (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return sendResponse(res, 401, 'No autenticado');
    }
    return sendResponse(res, 200, 'Usuario autenticado', {
        user: req.user,
    });
});

export default router;