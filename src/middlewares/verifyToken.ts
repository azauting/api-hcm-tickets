import type { Request, Response, NextFunction } from "express";
import { jwtVerify } from "jose";
import { Unauthorized } from "../controllers/apiResponse";

const JWT_SECRET_RAW = process.env.JWT_SECRET;
const JWT_SECRET = JWT_SECRET_RAW ? new TextEncoder().encode(JWT_SECRET_RAW) : null;

if (!JWT_SECRET) {
    console.error("FATAL: JWT_SECRET no configurado");
}
// Extendemos la Request para incluir el usuario autenticado
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        correo: string;
        role: string;
    };
}

/**
 * Middleware para verificar el token JWT de autenticación.
 * Si el token es válido, agrega el usuario a req.user.
 */
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        // No se envió el token
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(Unauthorized.statusCode).json(Unauthorized);
        }

        const token = authHeader.split(" ")[1];

        // Verificamos el token usando JOSE
        const { payload } = await jwtVerify(token, JWT_SECRET!);

        // Guardamos el payload del usuario decodificado
        req.user = payload as AuthenticatedRequest["user"];

        next();
    } catch (error) {
        console.error("Error al verificar token:", error);
        return res.status(401).json({
            statusCode: 401,
            message: "Token inválido o expirado",
            detail: "El token proporcionado no es válido o ha expirado.",
        });
    }
};
