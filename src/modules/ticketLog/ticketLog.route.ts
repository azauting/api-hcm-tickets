import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { ticketLogController } from './ticketLog.controller';
import { checkRole } from '../../middlewares/checkRole';

const router = express.Router();

// TODO: Obtener todos los movimientos globales
router.get('/tickets/movimientos', verifyToken,checkRole(['administrador']),ticketLogController.getAllMovements);

// TODO: Obtener el movimiento más reciente global
router.get('/tickets/movimientos/recientes', verifyToken,checkRole(['administrador', 'soporte']),ticketLogController.getLatestGlobalMovement);

// TODO : Obtener movimientos por usuario
router.get('/tickets/movimientos/usuario/:id', verifyToken,checkRole(['administrador']), ticketLogController.getMovementsByUser);



export default router;
