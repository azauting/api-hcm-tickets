import { describe, test, expect } from "bun:test";


const checkRole = (rolesPermitidos: string[], rolUsuario: string) => {
    return rolesPermitidos.includes(rolUsuario);
};

describe("CheckRole - Pruebas para verificar rol", () => {
    test("Debe permitir acceso si el rol está permitido", () => {
        const permitido = checkRole(["administrador", "soporte"], "soporte");
        expect(permitido).toBe(true);
    });

    test("Debe bloquear acceso si el rol NO está permitido", () => {
        const permitido = checkRole(["administrador"], "soporte");
        expect(permitido).toBe(false);
    });
});
