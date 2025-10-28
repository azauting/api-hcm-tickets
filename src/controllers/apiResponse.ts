// Respuestas estándar de la API para el endpoint de usuario
// 200 - Éxito al obtener usuario
export const UserRetrievedOk = { 
    statusCode: 200, 
    message: 'Usuario obtenido con éxito', 
    detail: 'La información del usuario ha sido recuperada correctamente' 
};

// 400 - Solicitud incorrecta
export const BadRequest = { 
    statusCode: 400, 
    message: 'Solicitud Incorrecta', 
    detail: 'La solicitud no pudo ser procesada debido a un error del cliente' 
};
// 401 - No autorizado
export const Unauthorized = { 
    statusCode: 401, 
    message: 'No Autorizado', 
    detail: 'Se requiere autenticación para acceder a este recurso' 
};
// 403 - Prohibido
export const Forbidden = { 
    statusCode: 403, 
    message: 'Prohibido', 
    detail: 'No tiene permiso para acceder a este recurso' 
};
// 404 - Usuario no encontrado
export const UserNotFound = { 
    statusCode: 404, 
    message: 'Usuario no encontrado', 
    detail: 'No se encontró un usuario con el ID proporcionado' 
};
// 500 - Error interno del servidor
export const InternalServerError = { 
    statusCode: 500, 
    message: 'Error Interno del Servidor', 
    detail: 'Ocurrió un error inesperado en el servidor' 
};


//404 - usarios no encontrados
export const UsersNotFound = { 
    statusCode: 404, 
    message: 'Usuarios no encontrados', 
    detail: 'No se encontraron usuarios en la base de datos' 
};

//200 - usuarios obtenidos con éxito
export const UsersRetrievedOk = {
    statusCode: 200,
    message: 'Usuarios obtenidos con éxito',
    detail: 'La información de los usuarios ha sido recuperada correctamente'
}


// Otras respuestas estándar de la API pueden ser agregadas aquí