import type { Request, Response } from 'express';
import { verifyUserCredentials } from '../services/auth.service';
import { createAuthToken } from '../services/jwt.service';
import type { UserWithRole } from '../types/user.type';

export const login = async (req: Request, res: Response) => {
    const { correo, contrasena } = req.body;
    console.log("Body recibido:", req.body);

    if (!correo || !contrasena) {
        return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }
    try {
        console.log("Verificando credenciales...");
        const result = await verifyUserCredentials({ correo, contrasena });
        console.log("Resultado:", result);

        if (result.status === "not_found") {
            return res.status(404).json({ message: "Correo no registrado" });
        }

        if (result.status === "invalid_password") {
            return res.status(401).json({ message: "Contraseña inválida" });
        }

        const user = result.user as UserWithRole;
        console.log("Usuario encontrado:", user);
        const token = await createAuthToken(user);
        console.log("Token generado correctamente");
        const { contrasena: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : error,
        });
    }
};