import { describe, test, expect, mock, afterAll } from "bun:test";
import { kpiService } from "../src/modules/kpis/kpis.service";
import pool from "../src/config/db.config";

// Guardamos referencia original del query de MySQL
const originalQuery = pool.query;

// Helper para mockear respuestas de la BD
function mockQuery(returnValue: any) {

    pool.query = mock(async () => returnValue);
}

describe("KPIs — Pruebas unitarias", () => {

    test("Debe retornar el total de tickets creados hoy", async () => {
        mockQuery([[{ total: 10 }]]);

        const total = await kpiService.getTicketCreatedToday();

        expect(total).toBe(10);
    });

    test("Debe calcular MTTR correctamente", async () => {
        const mockRows = [
            {
                year: 2025,
                month: 1,
                mes: "January",
                mttr_horas: 3.5
            }
        ];

        mockQuery([mockRows]);

        const result = await kpiService.getMTTRByMonth();

        expect(result[0].mttr_horas).toBe(3.5);
    });

    test("Debe contar tickets en progreso", async () => {
        mockQuery([[{ total: 4 }]]);

        const total = await kpiService.getTicketsInProgress();

        expect(total).toBe(4);
    });

    test("Debe calcular SLA Global correctamente", async () => {
        mockQuery([[{ cumplimiento_sla: 92.5 }]]);

        const result = await kpiService.getSLAComplianceGlobal();

        expect(result.cumplimiento_sla).toBe(92.5);
    });
});

// Restaurar el pool original
afterAll(() => {
    pool.query = originalQuery;
});
