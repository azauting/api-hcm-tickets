import express from 'express';
import { kpiController } from './kpis.controller';
import { verifyToken } from '../../middlewares/verifyToken';
import { checkRole } from '../../middlewares/checkRole';

const router = express.Router();


// todo:  KPIS DEL DÍA

router.get('/analytics/tickets-creados-hoy', verifyToken, checkRole(['administrador']), kpiController.getTicketsCreatedToday
);

router.get('/analytics/tickets-cerrados-hoy', verifyToken, checkRole(['administrador']), kpiController.getTicketsClosedToday
);

router.get('/analytics/tickets-abiertos', verifyToken, checkRole(['administrador']), kpiController.getOpenTickets
);

router.get('/analytics/tickets-en-proceso', verifyToken, checkRole(['administrador']), kpiController.getTicketsInProgress
);



// todo: KPIS POR UNIDAD

router.get('/analytics/unidades/creados-hoy', verifyToken, checkRole(['administrador']), kpiController.getTicketsCreatedTodayByUnit
);

router.get('/analytics/unidades/mes', verifyToken, checkRole(['administrador']), kpiController.getTicketsThisMonthByUnit
);

router.get('/analytics/unidades/mttr', verifyToken, checkRole(['administrador']), kpiController.getMTTRByUnit
);

router.get('/analytics/unidades/cerrados', verifyToken, checkRole(['administrador']), kpiController.getClosedTicketsByUnit
);

router.get('/analytics/unidades/abiertos', verifyToken, checkRole(['administrador']), kpiController.getOpenTicketsByUnit
);

router.get('/analytics/unidades/en-proceso', verifyToken, checkRole(['administrador']), kpiController.getTicketsInProgressByUnit
);



// todo : RENDIMIENTO DEL SOPORTE

router.get('/analytics/soporte/rendimiento', verifyToken, checkRole(['administrador']), kpiController.getSupportPerformance
);

// todo: SERIES DE TIEMPO (HISTÓRICO)

router.get('/analytics/tiempo/dia', verifyToken, checkRole(['administrador']), kpiController.getTicketsByDay
);

router.get('/analytics/tiempo/semana', verifyToken, checkRole(['administrador']), kpiController.getTicketsByWeek
);

router.get('/analytics/tiempo/mes', verifyToken, checkRole(['administrador']), kpiController.getTicketsByMonth
);

// ! este endpoint va a recibir un año
router.get('/analytics/tiempo/anio', verifyToken, checkRole(['administrador']), kpiController.getTicketsByYear
);


// todo : KPIS AGUS


router.get("/analytics/-resueltos-mes", verifyToken, checkRole(['administrador']), kpiController.getResolvedTicketsByMonth
);

router.get("/analytics/mttr-mensual", verifyToken, checkRole(['administrador']), kpiController.getMTTRByMonth
);

//todo : falta la eficacia de la unidad ()
router.get("/analytics/unidades/consolidado", verifyToken, checkRole(['administrador']), kpiController.getUnitConsolidatedStats
);

router.get('/analytics/unidades/resueltos-mensual', verifyToken, checkRole(['administrador']), kpiController.getMonthlyResolvedTicketsByUnit
);

router.get("/analytics/unidades/mttr-comparacion", verifyToken, checkRole(['administrador']), kpiController.getMTTRComparisonByUnit
);

router.get("/analytics/sla/mttr-prioridad", verifyToken, checkRole(['administrador']), kpiController.getMTTRByPriority
);

router.get("/analytics/rendimiento/individual", verifyToken, checkRole(['administrador']), kpiController.getSupportFullPerformance
);

router.get("/analytics/ubicaciones/treemap", verifyToken, checkRole(['administrador']), kpiController.getLocationTreemap
);

// todo : bonus track
// !en ver detalle de un ticket cuando el ticket se cierra, que aparezca el tiempo de resolucion del ticket

export default router;
