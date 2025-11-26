import express from 'express';
import { ticketController } from './user.controller';
import { checkRole } from '../../middlewares/checkRole';
import { verifyToken } from '../../middlewares/verifyToken';


const router = express.Router();

router.get('/users', ticketController.getUsers)
router.get('/users/:id', ticketController.getUserById); 
router.patch('/users/:id', verifyToken, checkRole(['administrador']), ticketController.updateUserPassword);
router.get('/user/soportes-disponibles', verifyToken, checkRole(['administrador', 'soporte']), ticketController.getAvailableSupports);
router.patch('/users/:id/update-role', verifyToken, checkRole(['administrador']), ticketController.updateUserRole);
router.patch('/users/:id/update-unit', verifyToken, checkRole(['administrador']), ticketController.updateUserUnit);

export default router;