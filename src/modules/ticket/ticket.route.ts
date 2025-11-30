import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { ticketController } from './ticket.controller';
import { checkRole } from '../../middlewares/checkRole';

const router = express.Router();

router.use(verifyToken);

//============================================================
//                      POST ROUTES
// ============================================================ 


// TODO: crear ticket - estado: ✅
router.post('/tickets', ticketController.createTicket);

// TODO: crear detalle observacion  - estado: ✅ 
router.post('/tickets/:id/detalle/observacion', checkRole(['soporte', 'administrador']), ticketController.addTicketObservation);

// TODO: crear detalle integrante - estado : ✅ 
router.post('/tickets/:id/detalle/integrante', checkRole(['soporte', 'administrador']), ticketController.addTicketMember);


//============================================================
//                      PATCH ROUTES
// ============================================================ 

// TODO: revisar ticket por el admin - estado: ✅
router.patch('/tickets/:id/review', checkRole(['administrador']),
    ticketController.updateTicketAdminReview);

// ruta para actualizar campos del ticket - para admininitrador
router.patch('/tickets/:id', checkRole(['administrador']), ticketController.updateTicketByAdmin);
// TODO: asignar ticket por el admin o soporte - estado: ✅
router.patch('/tickets/:id/assign', checkRole(['soporte', 'administrador']), ticketController.assignTicket);

// TODO: ruta para cancelar ticket antes de los 5 minutos
router.patch('/tickets/:id/cancel', ticketController.cancelTicket);

// TODO : cerrrar ticket solo admin/soporte - aqui debemos agregar la respuesta final y cambiar estado del ticket a 5
router.patch('/tickets/:id/close', checkRole(['soporte', 'administrador']), ticketController.closeTicket);

//============================================================
//                      GET ROUTES (ESPECIFICAS)
// ============================================================ 



// TODO: ruta para ver los tickets sin revisar - estado: ✅ (funciona)
router.get('/tickets/sin-revisar', checkRole(['administrador']), ticketController.getUnreviewedTickets);

// TODO: ruta para ver mis tickets creados - estado: ✅
router.get('/tickets/mis-tickets', ticketController.getTicketsByUserId);

// TODO: ruta para ver los tickets por unidad - estado: ✅
router.get('/tickets/revisados', checkRole(['administrador', 'soporte']), ticketController.getTicketsByUnit);

// TODO: Obtener todos los tickets internos
router.get('/tickets/internos', checkRole(['administrador', 'soporte']), ticketController.getInternalTickets);

// TODO: ruta para ver los tickets que tengan el ticket detalle de el soporte que esta asignado
router.get('/tickets/mis-tickets/asignados', checkRole(['soporte', 'administrador']), ticketController.getAssignedTickets);
//============================================================
//                     ROUTE DE TIPOS
// ============================================================ 

// TODO: rutas para ver los tipos listas - estado: ✅
router.get('/tickets/tipo_estado',verifyToken,ticketController.getStatusType);
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
