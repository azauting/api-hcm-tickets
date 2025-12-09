import express from 'express';
import { kpiController } from './kpis.controller';
import { verifyToken } from '../../middlewares/verifyToken';
import { checkRole } from '../../middlewares/checkRole';

const router = express.Router();


router.get('/analytics/tickets-creados-hoy',verifyToken, checkRole(['administrador']), kpiController.getTicketsCreatedToday);
router.get('/analytics/tickets-cerrados-hoy',verifyToken, checkRole(['administrador']),  kpiController.getTicketsClosedToday);
router.get('/analytics/tickets-abiertos',verifyToken, checkRole(['administrador']), kpiController.getOpenTickets);
router.get('/analytics/tickets-en-proceso',verifyToken, checkRole(['administrador']), kpiController.getTicketsInProgress);
router.get("/analytics/resueltos-mes",verifyToken, checkRole(['administrador']), kpiController.getResolvedTicketsByMonth);
router.get("/analytics/mttr-mensual",verifyToken, checkRole(['administrador']), kpiController.getMTTRByMonth);
router.get("/analytics/ubicaciones/treemap",verifyToken, checkRole(['administrador']), kpiController.getLocationTreemap);
router.get("/analytics/sla-prioridades",verifyToken, checkRole(['administrador']), kpiController.getSLAByPriority);
// HASTA AQUI PRIMERA VISTA GENERAL

router.get('/analytics/unidades/mes', verifyToken, checkRole(['administrador']), kpiController.getUnidadesMes);
router.get('/analytics/unidades/anual', verifyToken, checkRole(['administrador']), kpiController.getUnidadesAnual);
router.get('/analytics/years', verifyToken, checkRole(['administrador']), kpiController.getAvailableYears);

// HASTA AQUI VISTA POR UNIDAD
router.get('/analytics/rendimiento-por-unidad', verifyToken, checkRole(['administrador']), kpiController.getRendimientoEquipo);

export default router;
