import type { TicketForm } from './interfaces';

// Resultado de la validación
interface ValidationResult {
    isValid: boolean;
    message?: string;
    ticket?: TicketForm;
}

export const validadorTicketForm = (ticket: TicketForm): ValidationResult => {
    // Validar presencia de campos
    if (!ticket.asunto || !ticket.descripcion || !ticket.telefono || !ticket.autor_problema || !ticket.ubicacion_id) {
        return { isValid: false, message: 'Faltan campos obligatorios' };
    }

    // Limpiar y validar teléfono
    const telefonoLimpio = ticket.telefono.replace(/\D/g, '');
    if (!/^\d{7,15}$/.test(telefonoLimpio)) {
        return { isValid: false, message: 'Teléfono inválido' };
    }

    // Validar ubicacion_id
    if (typeof ticket.ubicacion_id !== 'number' || ticket.ubicacion_id <= 0) {
        return { isValid: false, message: 'ubicacion_id debe ser un número entero positivo' };
    }

    // Devolver ticket validado y con teléfono limpio
    return {
        isValid: true,
        ticket: { ...ticket, telefono: telefonoLimpio },
    };
};
