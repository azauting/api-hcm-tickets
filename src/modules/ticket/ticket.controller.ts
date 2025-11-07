import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../../middlewares/verifyToken';
import { validadorTicketForm } from '../../utils/validatorTicketForm';
import { ticketService } from './ticket.service';
import pino from 'pino';

const log = pino().child({ service: 'ticketController' });

export const newTicket = async (req: AuthenticatedRequest, res: Response) => {
    // primer paso, obtener el usuario_id desde el token
    const usuario_id_solicita = req.user!.id
    log.info({ usuario_id_solicita }, 'Creando ticket para usuario');
    // segundo paso, validar los datos del ticket
    const { isValid, message, ticket: ticketValidado } = validadorTicketForm(req.body);
    // Si no es valido, retornar error
    if (!isValid || !ticketValidado) {
        return res.status(400).json({ message });
    }
    log.info({ usuario_id_solicita }, 'Datos del ticket validados');
    // tercer paso, construir el objeto ticket
    const nuevoTicket = {
        usuario_id_solicita,
        asunto: ticketValidado.asunto,
        descripcion: ticketValidado.descripcion,
        telefono: ticketValidado.telefono,
        autor_problema: ticketValidado.autor_problema,
        ubicacion_id: ticketValidado.ubicacion_id, // todo: crear las ubicaciones
        direccion_ip: "vacio", // falta agregar esta parte 
        estado_de_revision: 1,
        tipo_prioridad_id: 1,
        tipo_unidad_id: 1,
        tipo_estado_id: 1,
        tipo_origen_id: 1,
        tipo_evento_id: 1,
    };
    // cuarto paso, enviar el ticket al service para crear el ticket
    const result = await ticketService.createTicket(nuevoTicket);

    // quinto paso, manejar los posibles resultados
    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }

    // sexto paso, obtener el id del ticket creado y registrar el movimiento en la auditoria
    const ticket_id = result.ticket_id;

    log.info({ usuario_id_solicita, ticket_id }, 'Ticket creado');

    // séptimo paso, registrar el movimiento en la tabla de ticket_movimiento
    const nuevo_ticket_movimiento = {
        ticket_id,
        usuario_id: usuario_id_solicita,
        tipo_movimiento_id: 1, // crear
    };

    // octavo paso, llamar al servicio para crear el ticket_movimiento
    const auditResult = await ticketService.createTicketLog(nuevo_ticket_movimiento);

    // noveno paso, manejar posibles errores en la auditoria
    if (auditResult.status === 'error') {
        log.error({ usuario_id_solicita, ticket_id }, 'Error al registrar el movimiento del ticket');
        
    }
    // décimo paso, retornar respuesta exitosa
    return res.status(201).json({
        message: 'Ticket creado exitosamente',
    });
};

export const getTicketById = async (req: Request, res: Response) => {
    const ticketId = Number(req.params.id);

    if (isNaN(ticketId)) {
        return res.status(400).json({ message: 'ID de ticket inválido' });
    }

    const result = await ticketService.getTicket(ticketId);

    if (result.status === 'not_found') {
        return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }

    return res.status(200).json({ ticket: result.ticket });
};

