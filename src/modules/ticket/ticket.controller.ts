import type { Request, Response } from 'express';
import type { AuthRequest } from '../../utils/interfaces';
import { validadorTicketForm } from '../../utils/validatorTicketForm';
import { ticketService } from './ticket.service';
import { logger } from '../../utils/logger';
import type { TicketCreateDTO } from '../../utils/interfaces';
import { ticketLogController } from '../ticketLog/ticketLog.controller';
import type { TicketMovimientoCreateDTO } from '../../utils/interfaces';
import { sendResponse } from '../../utils/helper';

const log = logger.child({ ubicacion: 'ticketController' });


const createTicket = async (req: AuthRequest, res: Response) => {
    // 1. obtener el usuario_id desde el token
    const usuario_id_solicita = req.user!.id
    log.info({ usuario_id_solicita, requestBody: req.body }, 'Recibiendo data para crear nuevo ticket');
    // 2.  validar los datos del ticket
    const { isValid, message, ticket: ticketValidado } = validadorTicketForm(req.body);
    // Si no es valido retorna un error
    if (!isValid || !ticketValidado) {
        return sendResponse(res, 400, `Datos del ticket inválidos: ${message}`);
    }
    // Si es valido, continua el proceso
    log.info({ usuario_id_solicita, ticketValidado}, 'Datos del ticket validados');
    // 3. preparar el objeto del nuevo ticket

    // Antes de preparar el objeto debemos obtener la direccion IP del usuario

    const ticketObject: TicketCreateDTO = {
        usuario_id_solicita, // id del usuario que solicita el ticket
        asunto: ticketValidado.asunto, // asunto del ticket
        descripcion: ticketValidado.descripcion, // descripcion del problema
        telefono: ticketValidado.telefono, // telefono de contacto
        autor_problema: ticketValidado.autor_problema, // quien reporta el problema
        ubicacion_id: ticketValidado.ubicacion_id, // todo: crear las ubicaciones
        direccion_ip: req.ip!, // obtener la IP del request
        estado_de_revision: 0, // por defecto en 0, cuando un admin revise el ticket se pone en 1
        tipo_prioridad_id: 1, // por defecto en baja
        tipo_unidad_id: 1, // por defecto en soporte
        tipo_estado_id: 1, // por defecto en abierto
        tipo_origen_id: 1, // revisar aqui
        tipo_evento_id: 1, // revisar aqui
    };
    // cuarto paso, enviar el ticket al service para crear el ticket
    const result = await ticketService.createTicket(ticketObject);

    // quinto paso, manejar los posibles resultados
    if (result.status === 'error') {
        return sendResponse(res, 500, result.message);
    }

    // sexto paso, obtener el id del ticket creado y registrar el movimiento en la auditoria
    const ticket_id = result.ticket_id;

    log.info({ usuario_id_solicita, ticket_id }, 'Ticket creado');

    // séptimo paso, registrar el movimiento en la auditoria
    const objetoMovimiento: TicketMovimientoCreateDTO = {
        ticket_id: ticket_id, // id del ticket creado
        tipo_movimiento_id: 1, // 1 = creación de ticket
        usuario_id: usuario_id_solicita // id del usuario que crea el ticket
    };
    // octavo paso, llamar al controlador de ticket log para crear el movimiento
    const logResult = await ticketLogController.createTicketLog(objetoMovimiento);

    if (logResult.status === 'error') {
        log.error({ ticket_id }, 'Error al crear el log del ticket')
        // llamamos al servicio para eliminar el ticket
        await ticketService.deleteTicketId(ticket_id);
        return sendResponse(res, 500, 'Error al crear el log del ticket, se ha eliminado el ticket creado');
    }
    // si todo sale bien
    log.info({ ticket_id }, 'Log del ticket creado correctamente');
    // décimo paso, retornar respuesta exitosa
    return sendResponse(res, 201, 'Ticket creado correctamente', { ticket_id });
};







/* EN CONSTRUCCION */

// metodo para obtener todos los tipos
/*const getTicketTypes = async (req: Request, res: Response) => {
    const type = req.params.type;
    const result = await ticketService.getAllTicketTypes();

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }

    if (result.status === 'empty') {
        return res.status(404).json({ message: 'No se encontraron tipos de ticket' });
    }

    return res.status(200).json({
        message: 'Tipos de ticket obtenidos correctamente',
        data: result.tipos,
    });
}; */
// metodo para obtener todos los tipos de estado
const getStatusType = async (req: Request, res: Response) => {

    const result = await ticketService.getAllTipoEstado();

    if (result.status === 'error') {
        return res.status(500).json({ message: result });
    }

    if (result.status === 'empty') {
        return res.status(404).json({
            message: 'No se encontraron tipos de estado registrados', data: [],
        });
    }

    // status === 'ok'
    return res.status(200).json({
        message: 'Tipos de estado obtenidos correctamente',
        data: result.estados,
    });
};
//metodos para obtener todos los tipos de prioridad

const getPriorityType = async (req: Request, res: Response) => {

    const result = await ticketService.getAllTipoPrioridad();

    if (result.status === 'empty') {
        return res.status(404).json({ message: 'No se encontraron prioridades' });
    }

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }

    return res.status(200).json({
        message: 'Tipos de prioridad obtenidos correctamente',
        data: result.priorities,
    });

}

// metodo para obtener todos los tipos de origen
const getOriginType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllTipoOrigen();

    if (result.status === 'empty') {
        return res.status(404).json({ message: 'No se encontraron tipos de origen' });
    }

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }

    return res.status(200).json({
        message: 'Tipos de origen obtenidos correctamente', data: result.origen,
    });
};

const getEventType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllTipoEvento();

    if (result.status === 'empty') {
        return res.status(404).json({ message: 'no se encontraron tipos de eventos' })
    }

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message })
    }

    return res.status(200).json({ message: 'tipos de eventos obtenidos correctamente', data: result.eventos })
}

const getLocationType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllUbicacion();

    if (result.status === 'empty') {
        return res.status(404).json({ message: 'no se encontraron las ubicaciones' })
    }

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message })
    }

    return res.status(200).json({ message: 'ubicaciones obtenidas correctamente', data: result.ubicaciones })


}

const getUnityType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllUnidad();

    if (result.status === 'empty') {
        return res.status(404).json({ message: 'No se encontraron tipos de unidad' });
    }

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }


    return res.status(200).json({
        message: 'Tipos de unidad obtenidos correctamente', data: result.unidades
    });
};


export { createTicket, getStatusType, getPriorityType, getOriginType, getEventType, getLocationType, getUnityType };