import type { Request } from 'express';
import type { JWTPayload as JoseJWTPayload } from 'jose';

// MODELOS DE LA BASE DE DATOS
// Usuario
export interface User {
    usuario_id: number;
    nombre_completo: string;
    correo: string;
    contrasena: string;
    rol_id: number;
    unidad_id?: number | null;
}

// Tipos básicos
export interface TipoRol {
    rol_id: number;
    tipo_rol: 'solicitante' | 'soporte' | 'administrador';
}

export interface TipoUnidad {
    unidad_id: number;
    tipo_unidad: 'soporte' | 'infraestructura' | 'desarrollo';
}

export interface TipoEstado {
    tipo_estado_id: number;
    estado: 'abierto' | 'en_proceso' | 'en_pausa' | 'cancelado' | 'cerrado';
}

export interface TipoPrioridad {
    tipo_prioridad_id: number;
    prioridad: 'baja' | 'media' | 'alta';
}

// Ticket principal
export interface Ticket {
    ticket_id: number;
    usuario_id_solicita: number;
    asunto: string;
    descripcion: string;
    telefono: number;
    autor_problema: string;
    direccion_ip?: string;
    estado_de_revision: boolean;
    tipo_prioridad_id: number;
    tipo_unidad_id: number;
    tipo_estado_id: number;
    tipo_origen_id: number;
    tipo_evento_id?: number | null;
    ubicacion_id: number;
}

// Ticket detalle y subtablas
export interface TicketDetalle {
    ticket_detalle_id: number;
    ticket_id: number;
    respuesta: string;
    soporte_asignado: number;
}

export interface TicketDetalleObservacion {
    ticket_detalle_observacion_id: number;
    ticket_detalle_id: number;
    observacion: string;
    usuario_id: number;
}

export interface TicketDetalleIntegrante {
    ticket_detalle_integrante_id: number;
    ticket_detalle_id: number;
    usuario_id: number;
}

// Movimientos
export interface TipoMovimiento {
    movimiento_id: number;
    movimiento: string;
    estado: boolean;
}

export interface TicketMovimiento {
    ticket_movimiento_id: number;
    ticket_id: number;
    tipo_movimiento_id: number;
    usuario_id: number;
    fecha: Date; // 
}

// INTEFACES PARA EL AUTH

export interface JWTPayload {
    id: number;
    correo: string;
    tipo_rol: string;
    tipo_unidad?: string | null;
}

export interface JWTPayload extends JoseJWTPayload {
    id: number;
    correo: string;
    tipo_rol: string;
    tipo_unidad?: string | null;
}
// extensiones para las interfaces

// Usuario con rol incluido
export interface UserWithRole extends User {
    tipo_rol: string;
    tipo_unidad?: string | null;
}

// AuthRequest extiende Request para incluir información del usuario autenticado
export interface AuthRequest extends Request {
    user?: {
        id: number;
        correo: string;
        tipo_rol: string;
        tipo_unidad?: string | null;
    };
}

// MOLDE PARA CRAER UN TICKET
export interface TicketCreateDTO {
    usuario_id_solicita: number;
    asunto: string;
    descripcion?: string;
    telefono?: string;
    autor_problema?: string;
    ubicacion_id?: number | null;
    direccion_ip: string; // guardar IPv4/IPv6
    estado_de_revision: number;
    tipo_prioridad_id: number;
    tipo_unidad_id: number;
    tipo_estado_id: number;
    tipo_origen_id: number;
    tipo_evento_id: number;
}

// MOLDE PARA CREAR UN MOVIMIENTO
export interface TicketMovimientoCreateDTO {
    ticket_id: number;
    tipo_movimiento_id: number;
    usuario_id: number;
}

export interface paginationInfo{
    page: number;
    limit: number;
    count: number;
}