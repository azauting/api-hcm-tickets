import { describe, test, expect } from "bun:test";
import * as jose from "jose";

const SECRET = new TextEncoder().encode("TEST_SECRET");

// Función mock de verifyToken
async function verify(token: string) {
    try {
        const data = await jose.jwtVerify(token, SECRET);
        return data.payload;
    } catch (err) {
        return null;
    }
}

describe("verifyToken - Pruebas básicas", () => {
    test("Debe validar un token correcto", async () => {
        const token = await new jose.SignJWT({ user: 10 })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("1h")
            .sign(SECRET);

        const result = await verify(token);
        expect(result?.user).toBe(10);
    });

    test("Debe fallar con un token inválido", async () => {
        const result = await verify("token-falso-xd");
        expect(result).toBe(null);
    });
});
