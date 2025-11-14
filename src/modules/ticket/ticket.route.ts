import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { createTicket,GetStatusType,getTicketById,GetPriorityType, GetOriginType, GetEventType, GetUbicacionType, GetUnidadType, GetLocationType, GetUnityType} from './ticket.controller';
import { checkRole } from '../../middlewares/checkRole';
const router = express.Router();


// rutas para obtener los tipos: 
// todo: rutas para ver los tipos listas
router.get('/tickets/tipo_unidad', verifyToken,GetUnityType) 
router.get('/tickets/tipo_estado',verifyToken,GetStatusType);
router.get('/tickets/tipo_prioridad', verifyToken,GetPriorityType);
router.get('/tickets/tipo_origen',verifyToken,GetOriginType)
router.get('/tickets/tipo_evento', verifyToken,GetEventType)
router.get('/tickets/ubicacion', verifyToken,GetLocationType)



// ruta para crear un nuevo ticket 
router.post('/tickets',createTicket, verifyToken)
// ruta para obtener un ticket por ID
router.get('/tickets/:id',verifyToken,getTicketById)

// ruta para obtener todos los tickets sin revisar
router.get('/tickets', verifyToken, (req, res) => {
    res.json({ message: 'Ruta para obtener todos los tickets sin revisar - en desarrollo' });
});

// en estas rutas puedes filtrar por estado/pioridad/sin asignar
// ruta para obtener todo los tickeks por unidad 


// ruta para administrador
// ruta para actualizar un ticket base estado/pioridad/soporte-encargado/unidad
// primero revisa el ticket para el administrador // solo la usa el administrador
router.put('/tickets/:id', verifyToken, (req, res) => {
    res.json({ message: 'Ruta para actualizar un ticket (admin) - en desarrollo' });
});


// rutas para ticket detalle
// ruta para asignar el soporte encargado del ticket // respuesta = null // puede usarla el administrador y soporte

router.post('/tickets/detalle', (req, res) => {
    res.json({ message: 'Ruta para asignar soporte encargado del ticket - en desarrollo' });
});


// ruta para obtener el ticket detalle
router.get('/tickets/detalle', (req, res) => {
    res.json({ message: 'Ruta para obtener el ticket detalle - en desarrollo' });
});

// ruta para actualizar ticket detalle // para agregar la respuesta
router.put('/tickets/detalle/:id', (req, res) => {
    res.json({ message: 'Ruta para actualizar ticket detalle - en desarrollo' });
});


// rutas para ticket detalle observacion // puede usarla el soporte y adminsitrador 
// ruta para crear una observacion
router.post('/tickets/detalle/observacion', (req, res) => {
    res.json({ message: 'Ruta para crear una observación - en desarrollo' });
});

// ruta para editar observacion
router.put('/tickets/detalle/observacion/:id', (req, res) => {
    res.json({ message: 'Ruta para editar observación - en desarrollo' });
});
// ruta para obtener la observacion del ticket

router.get('/tickets/detalle/observacion/:id', (req, res) => {
    res.json({ message: 'Ruta para obtener observaciones del ticket - en desarrollo' });
});




export default router;