import type { User, Ticket, UserWithRole } from './interfaces';

export type GetUserResult =
    | { status: 'ok'; user: User }
    | { status: 'not_found' };

export type GetAllUsersResult =
    | { status: 'ok'; users: User[] }
    | { status: 'empty' };

export type GetTicketResult =
    | { status: 'ok'; ticket: Ticket }
    | { status: 'not_found' };

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