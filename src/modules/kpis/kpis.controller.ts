import type { Request, Response } from "express";
import { kpiService } from "./kpis.service";
import { sendResponse } from "../../utils/helper";

export const kpiController = {

    // todo: KPIs DEL DÍA
    getTicketsCreatedToday: async (req: Request, res: Response) => {
        try {
            const total = await kpiService.getTicketCreatedToday();
            return sendResponse(res, 200, "Tickets creados hoy obtenidos correctamente", total);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener los tickets creados hoy");
        }
    },
    getTicketsClosedToday: async (req: Request, res: Response) => {
        try {
            const total = await kpiService.getTicketsClosedToday();
            return sendResponse(res, 200, "Tickets cerrados hoy obtenidos correctamente", total);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener los tickets cerrados hoy");
        }
    },
    getOpenTickets: async (req: Request, res: Response) => {
        try {
            const total = await kpiService.getOpenTickets();
            return sendResponse(res, 200, "Tickets abiertos obtenidos correctamente", total);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener los tickets abiertos");
        }
    },
    getTicketsInProgress: async (req: Request, res: Response) => {
        try {
            const total = await kpiService.getTicketsInProgress();
            return sendResponse(res, 200, "Tickets en proceso obtenidos correctamente", total);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener los tickets en proceso");
        }
    },
    // todo: KPIs POR UNIDAD
    getTicketsCreatedTodayByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getTicketsCreatedTodayByUnit();
            return sendResponse(res, 200, "Tickets creados hoy por unidad obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets creados por unidad");
        }
    },
    getTicketsThisMonthByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getTicketsThisMonthByUnit();
            return sendResponse(res, 200, "Tickets del mes por unidad obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets del mes por unidad");
        }
    },
    getMTTRByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getMTTRByUnit();
            return sendResponse(res, 200, "MTTR por unidad obtenido correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener MTTR por unidad");
        }
    },
    getClosedTicketsByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getClosedTicketsByUnit();
            return sendResponse(res, 200, "Tickets cerrados por unidad obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets cerrados por unidad");
        }
    },
    getOpenTicketsByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getOpenTicketsByUnit();
            return sendResponse(res, 200, "Tickets abiertos por unidad obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets abiertos por unidad");
        }
    },
    getTicketsInProgressByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getTicketsInProgressByUnit();
            return sendResponse(res, 200, "Tickets en proceso por unidad obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets en proceso por unidad");
        }
    },

    //  todo: DESEMPEÑO DE SOPORTE
    getSupportPerformance: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getSupportPerformance();
            return sendResponse(res, 200, "Desempeño del soporte obtenido correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener el desempeño del soporte");
        }
    },

    // todo :  SERIES DE TIEMPO (día, semana, mes, año)
    getTicketsByDay: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getTicketsByDay();
            return sendResponse(res, 200, "Tickets por día obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets por día");
        }
    },
    getTicketsByWeek: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getTicketsByWeek();
            return sendResponse(res, 200, "Tickets por semana obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets por semana");
        }
    },
    getTicketsByMonth: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getTicketsByMonth();
            return sendResponse(res, 200, "Tickets por mes obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets por mes");
        }
    },
    getTicketsByYear: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getTicketsByYear();
            return sendResponse(res, 200, "Tickets por año obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets por año");
        }
    },
    getResolvedTicketsByMonth: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getResolvedTicketsByMonth();
            return sendResponse(res, 200, "Tickets resueltos por mes obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener tickets resueltos por mes");
        }
    },
    getMTTRByMonth: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getMTTRByMonth();
            return sendResponse(res, 200, "MTTR mensual obtenido correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener MTTR mensual");
        }
    },
    getUnitConsolidatedStats: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getUnitConsolidatedStats();
            return sendResponse(res, 200, "Estadísticas consolidadas por unidad obtenidas correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener estadísticas por unidad");
        }
    },
    getMonthlyResolvedTicketsByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getMonthlyResolvedTicketsByUnit();
            return sendResponse(res, 200, "Tickets resueltos por unidad (mensual) obtenidos correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error", "Error al obtener tickets resueltos mensuales por unidad");
        }
    },
    getMTTRComparisonByUnit: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getMTTRComparisonByUnit();
            return sendResponse(res, 200, "Comparativa MTTR por unidad obtenida correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener comparativa de MTTR");
        }
    },
    getMTTRByPriority: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getMTTRByPriority();
            return sendResponse(res, 200, "MTTR por prioridad obtenido correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener MTTR por prioridad");
        }
    },
    getSupportFullPerformance: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getSupportFullPerformance();
            return sendResponse(res, 200, "Rendimiento individual obtenido correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener rendimiento individual");
        }
    },
    getLocationTreemap: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getLocationTreemap();
            return sendResponse(res, 200, "Treemap de ubicaciones obtenido correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener treemap de ubicaciones");
        }
    },
};
