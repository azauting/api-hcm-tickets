import type { Request, Response } from 'express';
import type { AuthRequest } from '../../utils/interfaces';
import { validadorTicketForm } from '../../utils/validatorTicketForm';
import { ticketService } from './ticket.service';
import { logger } from '../../utils/logger';
import type { TicketCreateDTO } from '../../utils/interfaces';

const log = logger.child({ ubicacion: 'ticketController' });

// controlador para crear un nuevo ticket, pendiente
const createTicket = async (req: AuthRequest, res: Response) => {
    // 1. obtener el usuario_id desde el token
    const usuario_id_solicita = req.user!.id
    log.info({ usuario_id_solicita }, 'Creando ticket para usuario');
    // 2.  validar los datos del ticket
    const { isValid, message, ticket: ticketValidado } = validadorTicketForm(req.body);
    // Si no es valido retorna un error
    if (!isValid || !ticketValidado) {
        return res.status(400).json({ message });
    }
    // Si es valido, continua el proceso
    log.info({ usuario_id_solicita }, 'Datos del ticket validados');
    // 3. preparar el objeto del nuevo ticket

    // Antes de preparar el objeto debemos obtener la direccion IP del usuario

    const ticketObject: TicketCreateDTO = {
        usuario_id_solicita,
        asunto: ticketValidado.asunto,
        descripcion: ticketValidado.descripcion,
        telefono: ticketValidado.telefono,
        autor_problema: ticketValidado.autor_problema,
        ubicacion_id: ticketValidado.ubicacion_id, // todo: crear las ubicaciones
        direccion_ip: req.ip!,
        estado_de_revision: 1,
        tipo_prioridad_id: 1,
        tipo_unidad_id: 1,
        tipo_estado_id: 1,
        tipo_origen_id: 1,
        tipo_evento_id: 1,
    };
    // cuarto paso, enviar el ticket al service para crear el ticket
    const result = await ticketService.createTicket(ticketObject);

    // quinto paso, manejar los posibles resultados
    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }

    // sexto paso, obtener el id del ticket creado y registrar el movimiento en la auditoria
    const ticket_id = result.ticket_id;

    log.info({ usuario_id_solicita, ticket_id }, 'Ticket creado');

    // décimo paso, retornar respuesta exitosa
    return res.status(201).json({
        message: 'Ticket creado exitosamente',
    });
};

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

    return res.status(200).json({message: 'Tipos de origen obtenidos correctamente', data: result.origen,
    });
}; 

const getEventType = async (req: Request, res: Response) => {
    const result = await ticketService.getAllTipoEvento();

    if (result.status === 'empty'){
        return res.status(404).json({message:'no se encontraron tipos de eventos'})
    }

    if (result.status === 'error'){
        return res.status(500).json({message: result.message})
    }

    return res.status(200).json({message: 'tipos de eventos obtenidos correctamente', data:result.eventos})
}

const getLocationType = async (req:Request,res:Response)=>{
    const result = await ticketService.GetAllUbicacion();

    if (result.status === 'empty'){
        return res.status(404).json({message:'no se encontraron las ubicaciones'})
    }
    
    if (result.status === 'error'){
        return res.status(500).json({message:result.message})
    }

    return res.status(200).json({message:'ubicaciones obtenidas correctamente',data:result.ubicaciones})


}

const getUnityType = async (req: Request, res: Response) => {
    const result = await ticketService.GetAllUnidad();

    if (result.status === 'empty') {
        return res.status(404).json({ message: 'No se encontraron tipos de unidad' });
    }

    if (result.status === 'error') {
        return res.status(500).json({ message: result.message });
    }

    
    return res.status(200).json({
        message: 'Tipos de unidad obtenidos correctamente',data: result.unidades});
};


export { createTicket, getStatusType, getPriorityType, getOriginType,getEventType,getLocationType,getUnityType };