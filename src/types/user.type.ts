export interface User {
    usuario_id: number;
    nombre_completo: string;
    correo: string;
    contrasena: string;
    rol_id: number;
}

export interface TipoRol {
    rol_id: number;
    nombre_rol: string;
}

export interface UserWithRole extends User {
    nombre_rol: string;
}