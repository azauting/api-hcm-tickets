import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';


const router = express.Router();



// ruta para mostrar todo los logs de tickets
router.get('/ticket-logs', verifyToken, (req, res) => {
    // Lógica para obtener todos los logs de tickets
    res.send('Obtener todos los logs de tickets');
});
// editar y manipulacion de los logs para el final

// el crear un log se hace automaticamente en el controller del ticket y al editar el ticket
export default router;