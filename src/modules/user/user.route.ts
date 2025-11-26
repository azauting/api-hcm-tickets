import express from 'express';
import { userController } from './user.controller';
import { checkRole } from '../../middlewares/checkRole';
import { verifyToken } from '../../middlewares/verifyToken';


const router = express.Router();

router.get('/users', userController.getUsers)
router.get('/users/:id', userController.getUserById); 
router.patch('/users/:id/update-password', verifyToken, checkRole(['administrador']), userController.updateUserPassword);
router.get('/user/soportes-disponibles', verifyToken, checkRole(['administrador', 'soporte']), userController.getAvailableSupports);
router.patch('/users/:id/update-role', verifyToken, checkRole(['administrador']), userController.updateUserRole);
router.patch('/users/:id/update-unit', verifyToken, checkRole(['administrador']), userController.updateUserUnit);

export default router;