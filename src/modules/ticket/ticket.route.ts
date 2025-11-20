import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { ticketController } from './ticket.controller';
//import {, getTicketById, getTicketsType} from './ticket.controller';
import { checkRole } from '../../middlewares/checkRole';
const router = express.Router();



// check: ruta para crear un ticket - estado: terminada 
router.post('/tickets', verifyToken, ticketController.createTicket)

// check: ruta para que el administrador revise el ticket - estado: pendiente a revision
// analizar: esta ruta puede tener una condicion para que solo el admin pueda cambiar ciertos campos 
// si es un soporte, solo puede cambiar el estado a "en proceso" o "cerrado"
router.patch('/tickets/:id/review', verifyToken, checkRole(['administrador']), ticketController.updateTicketAdmin)

// (dato): luego de que el admin revise el ticket, puede asignarselo un soporte encargado o dejarlo sin asignar, aqui se usa esta ruta (abajo)
// check: ruta para asignarse un ticket sin asignar - estado: pendiente a revision

router.post('/tickets/:id/assign', verifyToken, checkRole(['soporte', 'administrador']), ticketController.assignTicket)


// todo:
// - seba revisa types para ver que se puede hacer con las que repetimos mucho
// - seba ruta /observacion - insert tabla ticket_detalle_observacion
// - seba ruta /integrante - insert tabla ticket_detalle_integrante
// - seba ruta ticket sin revisar (para los administradores)
// check: ruta para agregar una observacion al ticket detalle - pendiente a revision
router.post('/tickets/:id/detalle/observacion', verifyToken, checkRole(['soporte', 'administrador']), ticketController.addTicketObservation);
// check: ruta para agregar un integrante al ticket detalle - pendiente a revision
router.post('/tickets/:id/detalle/integrante', verifyToken, checkRole(['soporte', 'administrador']), ticketController.addTicketMember);
// ruta para cerrar el ticket - pendiente a revision
router.patch('/tickets/:id/close', verifyToken, checkRole(['soporte', 'administrador']), ticketController.closeTicket);
// en este ruta se debe editar la respuesta del ticket detalle y cerrar el ticket

// # rutas get

// check: ruta para ver los tickets sin revisar
router.get('/tickets/sin-revisar', verifyToken, checkRole(['administrador']))

// check: ruta para ver mis tickets (usuarios) - en desarrollo
router.get('/tickets/mis-tickets', verifyToken, ticketController.getMyTickets);

// check: ruta para ver un ticket por ID - pendiente a revision
router.get('/tickets/:id', verifyToken, ticketController.getTicketById)



// ruta para obtener mis tickets
// dependiendo el rol mostramos mas o menos informacion


// ruta para ver los tickets por unidad 
router.get('/tickets/unidad/:unidad_id', verifyToken, checkRole(['administrador', 'soporte']), (req, res) => {
    res.json({ message: 'Ruta para obtener los tickets por unidad - en desarrollo' });
    // obtenemos la informacion del usuario desde el token
    // verificamos la unidad del usuario
    // llamamos al servicio para mostrar los ticket de su unidad 
    // funcion(unidad_id) -> el servicio recibe la unidad id y hace la consulta en base ese id
    // retornamos los tickets
    // paginacion y filtros (estado/pioridad/tipo)
});


// al terminar las anterior rutas, agregar las siguientes rutas:
// ruta para asignarse un ticket sin asignar
router.post('/tickets/:id/asignarse', verifyToken, checkRole(['soporte']), (req, res) => {
    res.json({ message: 'Ruta para asignarse un ticket sin asignar - en desarrollo' });
    // obtener el ticket id
    // llamamos al servicio para crear el ticket detalle
    // 
});

// ruta para agregar una obtervacion al ticket detalle
router.post('/tickets/:id/detalle/observacion', verifyToken, checkRole(['soporte', 'administrador']), (req, res) => {
    res.json({ message: 'Ruta para agregar una observación al ticket detalle - en desarrollo' });
    // obtener el ticket id 
    // llamamos al servicio para crear la observacion
});

// ruta para agregar un integrante al ticket detalle
router.post('/tickets/:id/detalle/integrante', verifyToken, checkRole(['soporte', 'administrador']), (req, res) => {
    res.json({ message: 'Ruta para agregar un integrante al ticket detalle - en desarrollo' });
    // obtener el ticket id 
    // llamamos al servicio para crear el integrante
});

/*
// rutas para obtener los tipos: 
// todo: rutas para ver los tipos listas
//router.get('/tickets/tipo_unidad', verifyToken, GetUnityType) 
///router.get('/tickets/tipo_estado',verifyToken, GetStatusType);
//router.get('/tickets/tipo_prioridad', verifyToken, GetPriorityType);
//router.get('/tickets/tipo_origen',verifyToken, GetOriginType)
//router.get('/tickets/tipo_evento', verifyToken, GetEventType)
//router.get('/tickets/ubicacion', verifyToken)
router.get('/tickets/types/:type', verifyToken)
router.get('/tickets/types', verifyToken)


// ruta para obtener un ticket por ID
//router.get('/tickets/:id', verifyToken, getTicketById)

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

router.post('/tickets/:id/detalle', (req, res) => {
    res.json({ message: 'Ruta para asignar soporte encargado del ticket - en desarrollo' });
});


// ruta para obtener el ticket detalle
router.get('/tickets/:id/detalle', (req, res) => {
    res.json({ message: 'Ruta para obtener el ticket detalle - en desarrollo' });
});

// ruta para actualizar ticket detalle // para agregar la respuesta
router.patch('/tickets/:id/detalle', (req, res) => {
    res.json({ message: 'Ruta para actualizar ticket detalle - en desarrollo' });
});


// rutas para ticket detalle observacion // puede usarla el soporte y adminsitrador 
// ruta para crear una observacion
router.post('/tickets/:id/detalle/observacion', (req, res) => {
    res.json({ message: 'Ruta para crear una observación - en desarrollo' });
});

// ruta para editar observacion
router.put('/tickets/:id/detalle/observacion/:id', (req, res) => {
    res.json({ message: 'Ruta para editar observación - en desarrollo' });
});
// ruta para obtener la observacion del ticket

router.get('/tickets/:id/detalle/observacion/:id', (req, res) => {
    res.json({ message: 'Ruta para obtener observaciones del ticket - en desarrollo' });
});


*/

export default router;