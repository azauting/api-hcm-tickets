import express from 'express';
import { kpiController } from './kpis.controller';
import { verifyToken } from '../../middlewares/verifyToken';
import { checkRole } from '../../middlewares/checkRole';

const router = express.Router();
router.use(verifyToken, checkRole(['administrador']));

// todo:  KPIS DEL DÍA

router.get('/analytics/tickets-creados-hoy', kpiController.getTicketsCreatedToday
);

router.get('/analytics/tickets-cerrados-hoy',kpiController.getTicketsClosedToday
);

router.get('/analytics/tickets-abiertos', kpiController.getOpenTickets
);

router.get('/analytics/tickets-en-proceso', kpiController.getTicketsInProgress
);



// todo: KPIS POR UNIDAD

router.get('/analytics/unidades/creados-hoy', kpiController.getTicketsCreatedTodayByUnit
);

router.get('/analytics/unidades/mes', kpiController.getTicketsThisMonthByUnit
);

router.get('/analytics/unidades/mttr', kpiController.getMTTRByUnit
);

router.get('/analytics/unidades/cerrados', kpiController.getClosedTicketsByUnit
);

router.get('/analytics/unidades/abiertos', kpiController.getOpenTicketsByUnit
);

router.get('/analytics/unidades/en-proceso', kpiController.getTicketsInProgressByUnit
);



// todo : RENDIMIENTO DEL SOPORTE

router.get('/analytics/soporte/rendimiento', kpiController.getSupportPerformance
);

// todo: SERIES DE TIEMPO (HISTÓRICO)

router.get('/analytics/tiempo/dia', kpiController.getTicketsByDay
);

router.get('/analytics/tiempo/semana', kpiController.getTicketsByWeek
);

router.get('/analytics/tiempo/mes', kpiController.getTicketsByMonth
);

// ! este endpoint va a recibir un año
router.get('/analytics/tiempo/anio', kpiController.getTicketsByYear
);


// todo : KPIS AGUS


router.get("/analytics/-resueltos-mes", kpiController.getResolvedTicketsByMonth
);

router.get("/analytics/mttr-mensual", kpiController.getMTTRByMonth
);

//todo : falta la eficacia de la unidad ()
router.get("/analytics/unidades/consolidado", kpiController.getUnitConsolidatedStats
);

router.get('/analytics/unidades/resueltos-mensual', kpiController.getMonthlyResolvedTicketsByUnit
);

router.get("/analytics/unidades/mttr-comparacion", kpiController.getMTTRComparisonByUnit
);

router.get("/analytics/sla/mttr-prioridad", kpiController.getMTTRByPriority
);

router.get("/analytics/rendimiento/individual", kpiController.getSupportFullPerformance
);

router.get("/analytics/ubicaciones/treemap", kpiController.getLocationTreemap
);

// todo : bonus track
// !en ver detalle de un ticket cuando el ticket se cierra, que aparezca el tiempo de resolucion del ticket

export default router;
