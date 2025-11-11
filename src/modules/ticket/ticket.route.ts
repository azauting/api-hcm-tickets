import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';

const router = express.Router();


// ruta para crear un nuevo ticket 
router.post('/tickets', verifyToken)
// ruta para obtener un ticket por ID
router.get('/tickets/:id', verifyToken)
// ruta para obtener todos los tickets sin revisar
router.get('/tickets', verifyToken)
// en estas rutas puedes filtrar por estado/pioridad/sin asignar
// ruta para obtener todo los tickeks por unidad 


// ruta para administrador
// ruta para actualizar un ticket base estado/pioridad/soporte-encargado/unidad
// primero revisa el ticket para el administrador // solo la usa el administrador
router.put('/tickets/:id', verifyToken)

// rutas para ticket detalle
// ruta para asignar el soporte encargado del ticket // respuesta = null // puede usarla el administrador y soporte
router.post('/tickets/detalle')
// ruta para obtener el ticket detalle
router.get('/tickets/detalle')
// ruta para actualizar ticket detalle // para agregar la respuesta
router.put('/tickets/detalle/:id')

// rutas para ticket detalle observacion // puede usarla el soporte y adminsitrador 
// ruta para crear una observacion
router.post('/tickets/detalle/observacion')
// ruta para editar observacion
router.put('/tickets/detalle/observacion/:id')
// ruta para obtener la observacion del ticket
router.get('/tickets/detalle/observacion/:id')

// rutas para obtener los tipos
router.get('/tickets/tipo_unidad', verifyToken)
router.get('/tickets/tipo_estado', verifyToken)
router.get('/tickets/tipo_prioridad', verifyToken)
router.get('/tickets/tipo_origen', verifyToken)
router.get('/tickets/tipo_evento', verifyToken)
router.get('/tickets/ubicacion', verifyToken)


export default router;