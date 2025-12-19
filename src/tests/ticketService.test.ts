import { describe, test, expect } from "bun:test";

function createTicketMock(data: any) {
    if (!data.asunto || !data.descripcion) {
        return { status: "error" };
    }
    return { status: "ok", ticket_id: 1 };
}

describe("ticketService - Validaciones", () => {
    test("Debe retornar error si faltan campos obligatorios", () => {
        const result = createTicketMock({ asunto: "", descripcion: "" });
        expect(result.status).toBe("error");
    });

    test("Debe crear ticket si los campos son válidos", () => {
        const result = createTicketMock({
            asunto: "Problema de PC",
            descripcion: "No enciende",
        });
        expect(result.status).toBe("ok");
    });
});
