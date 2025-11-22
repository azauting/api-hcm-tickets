import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { ticketLogController } from './ticketLog.controller';

const router = express.Router();

// TODO: Obtener todos los movimientos globales
router.get('/tickets/movimientos', verifyToken, ticketLogController.getAllMovements);

// TODO: Obtener el movimiento más reciente global
router.get('/tickets/movimientos/reciente', verifyToken, ticketLogController.getLatestGlobalMovement);

// TODO : Obtener movimientos por usuario
router.get('/tickets/movimientos/usuario/:id', verifyToken, ticketLogController.getMovementsByUser);



export default router;
