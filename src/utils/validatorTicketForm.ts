// ticketForm
export interface TicketForm {
    asunto: string;
    descripcion: string;
    telefono: string;
    autor_problema: string;
    ubicacion_id: number;
    ip_manual?: string;
}

// Resultado de la validación
interface ValidationResult {
    isValid: boolean;
    message?: string;
    ticket?: TicketForm;
}

interface ValidationResult {
    isValid: boolean;
    message?: string;
    ticket?: TicketForm;
}

export const validadorTicketForm = (ticket: TicketForm): ValidationResult => {

    // Validar campos obligatorios
    if (!ticket.asunto || !ticket.descripcion || !ticket.telefono || !ticket.autor_problema || !ticket.ubicacion_id) {
        return { isValid: false, message: 'Faltan campos obligatorios' };
    }

    // Limpiar teléfono
    const telefonoLimpio = ticket.telefono.replace(/\D/g, '');
    if (!/^\d{7,15}$/.test(telefonoLimpio)) {
        return { isValid: false, message: 'Teléfono inválido' };
    }

    // Validar ubicacion_id
    if (typeof ticket.ubicacion_id !== 'number' || ticket.ubicacion_id <= 0) {
        return { isValid: false, message: 'ubicacion_id debe ser un número entero positivo' };
    }

    // Validar IP manual si viene
    if (ticket.ip_manual) {
        // la ip deber ser: xxx.xxx.xxx.xxx donde xxx es un numero entre 0 y 255
        const ipRegex =
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        if (!ipRegex.test(ticket.ip_manual)) {
            return { isValid: false, message: 'Dirección IP manual inválida' };
        }
    }

    return {
        isValid: true,
        ticket: { ...ticket, telefono: telefonoLimpio }
    };
};
