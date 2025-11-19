import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';
import { cancelTicket, createTicket, getTicketById, getTicketsType} from './ticket.controller';
import { checkRole } from '../../middlewares/checkRole';
const router = express.Router();





// checklist
// - crear ticket [listo]
// - registrar movimiento en la auditoria [listo]


// ruta para crear un nuevo ticket 
router.post('/tickets', verifyToken, createTicket)


// ruta para obtener mis tickets

// todo : falta agregar lo que ven los usuarios y los administradores/soporte
router.get('/tickets/mis-tickets', verifyToken, getTicketsType)



// ruta para ticket por id
router.get('/tickets/:id', verifyToken, getTicketById)
// dependiendo el rol mostramos mas o menos informacion

// ruta para cancelar ticket antes de los 5 minutos
router.delete('/tickets/:id',verifyToken,cancelTicket)



// ruta para ver los tickets por unidad 
router.get('/tickets/unidad/:unidad_id', verifyToken, checkRole(['administrador', 'soporte']), (req, res) => {
    res.json({ message: 'Ruta para obtener los tickets por unidad - en desarrollo' });
    // obtenemos la informacion del usuario desde el token
    // verificamos la unidad del usuario
    // llamamos al servicio para mostrar los ticket de su unidad 
    // funcion(unidad_id) -> el servicio recibe la unidad id y hace la consulta en base ese id
    // retornamos los tickets
    // paginacion y filtros (estado/pioridad/tipo)
});




// ruta para revisar y editar un ticket por id
// el usuario solicitante no puede editar el ticket despues de crearlo
// el administrador puede cambiar cualquier campo del ticket
// el caso de uso para un administrador es revisar un ticket para cambiar estado/pioridad/unidad y estado_revision = 1, por defecto en = 0
// luego asignarselo un soporte encargado o dejarlo sin asignar
router.put('/tickets/:id', verifyToken, checkRole(['administrador']), (req, res) => {
    res.json({ message: 'Ruta para editar un ticket por ID - en desarrollo' });
    // obtener el ticket id
    // verificamos el rol del usuario
    // dependiendo el rol permitimos editar ciertos campos
    // llamamos al servicio
    // actualizamos el ticket
    // retornamos el ticket actualizado
});

// al terminar las anterior rutas, agregar las siguientes rutas:
// ruta para asignarse un ticket sin asignar
router.post('/tickets/:id/asignarse', verifyToken, checkRole(['soporte']), (req, res) => {
    res.json({ message: 'Ruta para asignarse un ticket sin asignar - en desarrollo' });
    // obtener el ticket id
    // llamamos al servicio para crear el ticket detalle
    // 
});

// ruta para agregar una obtervacion al ticket detalle
router.post('/tickets/:id/detalle/observacion', verifyToken, checkRole(['soporte', 'administrador']), (req, res) => {
    res.json({ message: 'Ruta para agregar una observación al ticket detalle - en desarrollo' });
    // obtener el ticket id 
    // llamamos al servicio para crear la observacion
});

// ruta para agregar un integrante al ticket detalle
router.post('/tickets/:id/detalle/integrante', verifyToken, checkRole(['soporte', 'administrador']), (req, res) => {
    res.json({ message: 'Ruta para agregar un integrante al ticket detalle - en desarrollo' });
    // obtener el ticket id 
    // llamamos al servicio para crear el integrante
});

/*
// rutas para obtener los tipos: 
// todo: rutas para ver los tipos listas
//router.get('/tickets/tipo_unidad', verifyToken, GetUnityType) 
///router.get('/tickets/tipo_estado',verifyToken, GetStatusType);
//router.get('/tickets/tipo_prioridad', verifyToken, GetPriorityType);
//router.get('/tickets/tipo_origen',verifyToken, GetOriginType)
//router.get('/tickets/tipo_evento', verifyToken, GetEventType)
//router.get('/tickets/ubicacion', verifyToken)
router.get('/tickets/types/:type', verifyToken)
router.get('/tickets/types', verifyToken)


// ruta para obtener un ticket por ID
//router.get('/tickets/:id', verifyToken, getTicketById)

// ruta para obtener todos los tickets sin revisar
router.get('/tickets', verifyToken, (req, res) => {
    res.json({ message: 'Ruta para obtener todos los tickets sin revisar - en desarrollo' });
});

// en estas rutas puedes filtrar por estado/pioridad/sin asignar
// ruta para obtener todo los tickeks por unidad 


// ruta para administrador
// ruta para actualizar un ticket base estado/pioridad/soporte-encargado/unidad
// primero revisa el ticket para el administrador // solo la usa el administrador
router.put('/tickets/:id', verifyToken, (req, res) => {
    res.json({ message: 'Ruta para actualizar un ticket (admin) - en desarrollo' });
});


// rutas para ticket detalle
// ruta para asignar el soporte encargado del ticket // respuesta = null // puede usarla el administrador y soporte

router.post('/tickets/:id/detalle', (req, res) => {
    res.json({ message: 'Ruta para asignar soporte encargado del ticket - en desarrollo' });
});


// ruta para obtener el ticket detalle
router.get('/tickets/:id/detalle', (req, res) => {
    res.json({ message: 'Ruta para obtener el ticket detalle - en desarrollo' });
});

// ruta para actualizar ticket detalle // para agregar la respuesta
router.patch('/tickets/:id/detalle', (req, res) => {
    res.json({ message: 'Ruta para actualizar ticket detalle - en desarrollo' });
});


// rutas para ticket detalle observacion // puede usarla el soporte y adminsitrador 
// ruta para crear una observacion
router.post('/tickets/:id/detalle/observacion', (req, res) => {
    res.json({ message: 'Ruta para crear una observación - en desarrollo' });
});

// ruta para editar observacion
router.put('/tickets/:id/detalle/observacion/:id', (req, res) => {
    res.json({ message: 'Ruta para editar observación - en desarrollo' });
});
// ruta para obtener la observacion del ticket

router.get('/tickets/:id/detalle/observacion/:id', (req, res) => {
    res.json({ message: 'Ruta para obtener observaciones del ticket - en desarrollo' });
});


*/

export default router;