import type { User, Ticket, UserWithRole, TipoEstado, paginationInfo, TicketFullData } from './interfaces';

// Respuesta genrerica para services con la misma estructura de datos
export type ApiResponse<T> =
    | { status: 'ok'; data: T[] }
    | { status: 'empty' }
    | { status: 'error'; message: string };

export type GetUserResult =
    | { status: 'ok'; user: User }
    | { status: 'not_found' };

export type GetAllUsersResult =
    | { status: 'ok'; users: User[] }
    | { status: 'empty' };


export type GetAllTicketsResult =
    | { status: 'ok'; tickets: Ticket[] }
    | { status: 'empty' };

export type Credentials = {
    correo: string;
    contrasena: string;
};

export type VerifyResult =
    | { status: 'not_found' }
    | { status: 'invalid_password' }
    | { status: 'ok'; user: UserWithRole };



export type CreateTicketResult =
    | { status: 'ok'; ticket_id: number }
    | { status: 'error'; message: string };

export type GetTicketsType =
    | { status: 'ok'; tickets: any[]; pagination: paginationInfo }
    | { status: 'empty' }
    | { status: 'error'; message: string }

export type CancelTicketResult =
    | { status: 'ok' }
    | { status: 'error'; message: string }
    | { status: 'forbidden'; message: string }
    | { status: 'tiempo expirado'; message: string };


export type GetTicketResult =
    | { status: "ok"; data: TicketFullData }
    | { status: "not_found"; message: string }
    | { status: "error"; message: string };

export type GetAllSupportsResult =
    | { status: 'ok'; supports: User[] }
    | { status: 'empty' };