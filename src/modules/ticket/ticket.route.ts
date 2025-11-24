import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { ticketController } from './ticket.controller';
import { checkRole } from '../../middlewares/checkRole';

const router = express.Router();

//============================================================
//                      POST ROUTES
// ============================================================ 

// TODO: crear ticket - estado: ✅
router.post('/tickets', verifyToken, ticketController.createTicket);

// TODO: crear detalle observacion  - estado: ✅ 
router.post('/tickets/:id/detalle/observacion', verifyToken, checkRole(['soporte', 'administrador']), ticketController.addTicketObservation);

// TODO: crear detalle integrante - estado : ✅ 
router.post('/tickets/:id/detalle/integrante', verifyToken, checkRole(['soporte', 'administrador']), ticketController.addTicketMember);


//============================================================
//                      PATCH ROUTES
// ============================================================ 

// TODO: revisar ticket por el admin - estado: ✅
router.patch('/tickets/:id/review', verifyToken, checkRole(['administrador']),
    ticketController.updateTicketAdmin);

// TODO: asignar ticket por el admin o soporte - estado: ✅
router.patch('/tickets/:id/assign', verifyToken, checkRole(['soporte', 'administrador']), ticketController.assignTicket);

// TODO: ruta para cancelar ticket antes de los 5 minutos
router.patch('/tickets/:id/cancel', verifyToken, ticketController.cancelTicket);

// TODO : cerrrar ticket solo admin/soporte - estado: ✅
router.patch('/tickets/:id/close', verifyToken, checkRole(['soporte', 'administrador']), ticketController.closeTicket);



//============================================================
//                      GET ROUTES (ESPECIFICAS)
// ============================================================ 


// TODO: ruta para ver los tickets sin revisar - estado: ✅ (funciona)
router.get('/tickets/sin-revisar', verifyToken, checkRole(['administrador']), ticketController.getUnreviewedTickets);

// TODO: ruta para ver mis tickets creados - estado: ✅
router.get('/tickets/mis-tickets', verifyToken, ticketController.getTicketsByUserId);

// TODO: ruta para ver los tickets por unidad - estado: ✅
router.get('/tickets/revisados', verifyToken, checkRole(['administrador', 'soporte']), ticketController.getTicketsByUnit);

// TODO: Obtener todos los tickets (solo admin)
router.get('/tickets/all', verifyToken, checkRole(['administrador']), ticketController.getAllTickets);


//============================================================
//                     ROUTE DE TIPOS
// ============================================================ 

// TODO: rutas para ver los tipos listas - estado: ✅
router.get('/tickets/tipo_estado', verifyToken, ticketController.getStatusType);
router.get('/tickets/tipo_prioridad', verifyToken, ticketController.getPriorityType);
router.get('/tickets/tipo_origen', verifyToken, ticketController.getOriginType);
router.get('/tickets/tipo_evento', verifyToken, ticketController.getEventType);
router.get('/tickets/ubicacion', verifyToken, ticketController.getLocationType);
router.get('/tickets/tipo_unidad', verifyToken, ticketController.getUnityType);


//============================================================
//              RUTAS DE DETALLES INDIVIDUALES
// ============================================================ 


// TODO: obtener solo el detalle del ticket
router.get('/tickets/:id/detalle', verifyToken, ticketController.getTicketDetailsById);

// TODO: obtener solo las observaciones del ticket
router.get('/tickets/:id/detalle/observaciones', verifyToken, ticketController.getTicketObservationsById);

// TODO: obtener solo los integrantes del ticket
router.get('/tickets/:id/detalle/integrantes', verifyToken, ticketController.getTicketMembersById);


//============================================================
//                      TICKET ROUTES (RUTA GENERAL)
// ============================================================ 


// TODO: ruta para ver un ticket específico (devuelve ticket + detalle + observaciones + integrantes)
router.get('/tickets/:id', verifyToken, ticketController.getTicketById);


export default router;
