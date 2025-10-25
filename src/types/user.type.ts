export interface User {
    usuario_id: number;
    nombre_completo: string;
    correo_electronico: string;
    password: string;
    rol_id: number;
}

export interface TipoRol {
    rol_id: number;
    nombre_rol: string;
}
