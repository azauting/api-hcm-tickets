import express from 'express';
import { newTicket, getTicketById } from './ticket.controller';
import { verifyToken } from '../../middlewares/verifyToken';


const router = express.Router();

// Rutas de ticket
router.post('/tickets', verifyToken, newTicket); // falta mejorar
router.get('/tickets/:id', getTicketById); // falta mejorar
// router.get('/tickets/movimientos', getTicketMovements); // pendiente

export default router;