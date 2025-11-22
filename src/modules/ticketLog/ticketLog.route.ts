import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { ticketLogController } from './ticketLog.controller';


const router = express.Router();



// ruta para mostrar todo los logs de tickets
router.get('/ticket-logs', verifyToken, (req, res) => {
    // Lógica para obtener todos los logs de tickets
    res.send('Obtener todos los logs de tickets');
});
// editar y manipulacion de los logs para el final


router.get('/tickets/:id/movimientos', verifyToken, ticketLogController.getTicketMovements);

router.get('/tickets/:id/movimientos/recientes', verifyToken, ticketLogController.getLatestTicketMovement);



export default router;