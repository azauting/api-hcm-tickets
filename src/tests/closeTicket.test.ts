import { expect, test, describe, mock, afterAll } from "bun:test";
import { ticketService } from "../src/modules/ticket/ticket.service";
import pool from "../src/config/db.config";

// Guardamos la query real
const originalQuery = pool.query;

// Helper para mockear pool.query
function mockQuery(returnValue: any) {
    pool.query = mock(async () => returnValue) as any;
}

describe("Ticket - Cierre de ticket", () => {
    test("Debe registrar movimiento 5 y retornar status ok", async () => {
        mockQuery([{ affectedRows: 1 }]); 

        const result = (await ticketService.closeTicket(
            700,
            "respuesta final",
            38
        )) as any;

        expect(result.status).toBe("ok");
        expect(result.data).toBeDefined();
        expect(result.data[0].ticket_id).toBe(700);
        expect(result.data[0].respuesta_final).toBe("respuesta final");
    });

    test("Debe retornar status 'empty' si no afectó filas", async () => {
        mockQuery([{ affectedRows: 0 }]); // Nada se actualizó

        const result = (await ticketService.closeTicket(999, "resp", 38)) as any;

        expect(result.status).toBe("empty");
    });

    test("Debe retornar 'error' si ocurre excepción SQL", async () => {
        pool.query = mock(async () => {
            throw new Error("SQL error");
        }) as any;

        const result = (await ticketService.closeTicket(1, "resp", 38)) as any;

        expect(result.status).toBe("error");
        expect(result.message).toBe("Error al cerrar el ticket");
    });
});

// Restaurar query original
afterAll(() => {
    pool.query = originalQuery;
});
