import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { ticketController } from './ticket.controller';
//import {, getTicketById, getTicketsType} from './ticket.controller';
import { checkRole } from '../../middlewares/checkRole';
const router = express.Router();


// * POST Routes
// ! REVISAR SI TIENEN AUDITORIA/LOGS
// ! REVISAR SI FUNCIONAN CORRECTAMENTE
// TODO: crear ticket - estado: ✅
router.post('/tickets', verifyToken, ticketController.createTicket); 
// TODO: crear detalle observacion  - estado: ✅ (falta desarrollar)
router.post('/tickets/:id/detalle/observacion', verifyToken, checkRole(['soporte', 'administrador']), ticketController.addTicketObservation);
// TODO: crear detalle integrante - estado : ✅ (falta revisar)
router.post('/tickets/:id/detalle/integrante', verifyToken, checkRole(['soporte', 'administrador']), ticketController.addTicketMember);

// * PATCH Routes
// ! REVISAR SI TIENEN AUDITORIA/LOGS
// ! REVISAR SI FUNCIONAN CORRECTAMENTE
// TODO: revisar ticket por el admin - estado: ✅
router.patch('/tickets/:id/review',verifyToken,  checkRole(['administrador']),  ticketController.updateTicketAdmin); 
// TODO: asignar ticket por el admin o soporte - estado: ✅
router.patch('/tickets/:id/assign',verifyToken,checkRole(['soporte', 'administrador']),ticketController.assignTicket);
// TODO: cambios del ticket por parte del soporte - administrador - estado: ✅ (falta desarrollar)
router.patch('/tickets/:id/update', verifyToken, checkRole(['soporte', 'administrador']), ticketController.updateTicketSupport);

// * GET Routes
// ! REVISAR SI FUNCIONAN CORRECTAMENTE
// TODO: ruta para ver los tickets sin revisar - estado : ✅ (falta revisar)
router.get('/tickets/sin-revisar', verifyToken, checkRole(['administrador']), ticketController.getUnreviewedTickets);
// TODO : ruta para ver mis tickets creados - estado: ✅
router.get('/tickets/mis-tickets', verifyToken, ticketController.getTicketsByUserId);
// TODO: ruta para ver un ticket especifico - pendiente a revision
router.get('/tickets/:id', verifyToken, ticketController.getTicketById);
// TODO: ruta para ver los tickets por unidad - estado: : ✅
router.get('/tickets/revisados/:unidad_id', verifyToken, checkRole(['administrador', 'soporte']), ticketController.getTicketsByUnitId);


// rutas para obtener los tipos: 
// todo: rutas para ver los tipos listas

router.get('/tickets/tipo_estado', verifyToken, ticketController.getStatusType);
router.get('/tickets/tipo_prioridad', verifyToken, ticketController.getPriorityType);
router.get('/tickets/tipo_origen', verifyToken, ticketController.getOriginType);
router.get('/tickets/tipo_evento', verifyToken, ticketController.getEventType)
router.get('/tickets/ubicacion', verifyToken, ticketController.getLocationType);
router.get('/tickets/tipo_unidad', verifyToken, ticketController.getUnityType)

export default router;