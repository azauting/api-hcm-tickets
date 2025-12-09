import type { Request, Response } from "express";
import { kpiService } from "./kpis.service";
import { sendResponse } from "../../utils/helper";

export const kpiController = {
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
    getLocationTreemap: async (req: Request, res: Response) => {
        try {
            const data = await kpiService.getLocationTreemap();
            return sendResponse(res, 200, "Treemap de ubicaciones obtenido correctamente", data);
        } catch (error) {
            return sendResponse(res, 500, "Error al obtener treemap de ubicaciones");
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
    getSLAByPriority: async (req: Request, res: Response) => {
        try {
            const cumplimientoGlobal = await kpiService.getSLAComplianceGlobal();
            const cumplimientoPorPrioridad = await kpiService.getSLAComplianceByPriority();
            const mttrPorPrioridad = await kpiService.getMTTRByPriority();

            return res.json({
                success: true,
                message: "SLA obtenido correctamente",
                data: {
                    cumplimiento_global: cumplimientoGlobal.cumplimiento_sla,
                    prioridades: cumplimientoPorPrioridad.map((p, index) => ({
                        prioridad: p.prioridad,
                        cumplimiento_sla: p.cumplimiento_sla,
                        mttr_horas: mttrPorPrioridad[index]?.mttr_horas ?? null,
                        meta: index === 0 ? 1 : index === 1 ? 2 : 3 // Alta=1h, Media=2h, Baja=3h
                    }))
                }
            });

        } catch (err) {
            console.error("Error en KPI SLA:", err);
            return res.status(500).json({
                success: false,
                message: "Error obteniendo SLA",
                error: err
            });
        }
    },
    // HASTA AQUI VISTA GENERAL

    getUnidadesMes: async (req: Request, res: Response) => {
        try {
            const year = parseInt(req.query.year as string);
            const month = parseInt(req.query.month as string);

            const data = await kpiService.getUnidadesMes(year, month);

            return res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error("Error en unidades mensual:", error);
            return res.status(500).json({ success: false, message: "Error obteniendo datos mensuales" });
        }
    },
    getUnidadesAnual: async (req: Request, res: Response) => {
        try {
            const year = parseInt(req.query.year as string);

            const data = await kpiService.getUnidadesAnual(year);

            return res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error("Error en unidades anual:", error);
            return res.status(500).json({ success: false, message: "Error obteniendo datos anuales" });
        }
    },
    getAvailableYears: async (req: Request, res: Response) => {
        try {
            const years = await kpiService.getAvailableYears();

            return res.json({
                success: true,
                data: years
            });
        } catch (error) {
            console.error("Error obteniendo años disponibles:", error);
            return res.status(500).json({
                success: false,
                message: "Error obteniendo años"
            });
        }
    },

    // hasta aqui vista por unidad

    getRendimientoEquipo: async (req: Request, res: Response) => {
        try {
            const year = parseInt(req.query.year as string);
            const month = parseInt(req.query.month as string);
            const data = await kpiService.getRendimientoEquipo(year, month);

            return res.json({
                success: true,
                data
            });
        } catch (error) {
            console.error("Error en rendimiento de equipo:", error);
            return res.status(500).json({ success: false, message: "Error obteniendo rendimiento de equipo" });
        }
    }
};
