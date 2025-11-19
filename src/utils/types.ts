import type { User, Ticket, UserWithRole, TipoEstado, paginationInfo } from './interfaces';

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

export type GetTicketResult =
    | { status: 'ok'; ticket: Ticket }
    | { status: 'not_found' }
    | { status: 'error'; message: string };

export type CreateTicketResult =
    | { status: 'ok'; ticket_id: number }
    | { status: 'error'; message: string };

export type GetAllTipoEstado =
    | { status: 'ok'; estados: TipoEstado[] }
    | { status: 'empty' }
    | { status: 'error'; message: string };

export type GetPriorityType =
    | { status: 'ok'; prioridades: any[] }
    | { status: 'empty' }
    | { status: 'error'; message: string };

export type GetOriginType =
    | { status: 'ok'; origen: any[] }
    | { status: 'empty' }
    | { status: 'error'; message: string };

export type GetEventType =
    | { status: 'ok'; eventos: any[] }
    | { status: 'empty' }
    | { status: 'error'; message: string };
    
export type GetUbicationType = 
    | {status:'ok'; ubicaciones: any[]}
    | {status:'empty'}
    | {status: 'error'; message: string}

export type GetUnityType =  
    | { status: 'ok'; unidades: any[] }
    | { status: 'empty' }
    | { status: 'error'; message: string }


export type GetTicketsType =
    | { status: 'ok'; tickets: any[]; pagination: paginationInfo}
    | { status: 'empty' }
    | { status: 'error'; message: string }