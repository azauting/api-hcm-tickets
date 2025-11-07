import type { Response } from 'express';
/**
 * Intenta parsear un parámetro de ruta a número entero.
 * Lanza un error si no es un string o no es un número válido.
 */
export const parseIdParam = (param: unknown): number => {
    if (typeof param !== 'string') {
        throw new Error('El parámetro ID debe ser una cadena');
    }

    const id = Number.parseInt(param, 10);
    if (Number.isNaN(id)) {
        throw new Error('Parametro ID inválido');
    }

    return id;
};

/**
 * Envía una respuesta JSON estándar con formato consistente.
*/
export const sendResponse = (
    res: Response,
    status: number,
    message: string,
    data?: any
) => {
    return res.status(status).json({
        success: status < 400,
        message,
        data: data ?? null,
    });
};
