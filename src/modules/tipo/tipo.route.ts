import express from 'express'
import { tipoController } from './tipo.controller';
import { checkRole } from '../../middlewares/checkRole';
import { verifyToken } from '../../middlewares/verifyToken';

const router = express.Router();

// crear tipo_evento
router.post('/tipos/evento', verifyToken, checkRole(['administrador']), tipoController.createTipoEvento);

// crear area
router.post('/tipos/area', verifyToken, checkRole(['administrador']), tipoController.createTipoArea);

// crear ubicacion
// a; crear una ubiacion se le debe asignar un area existente
router.post('/tipos/ubicacion', verifyToken, checkRole(['administrador']), tipoController.createUbicacion);


// obtener todos los tipos de evento
router.get('/tipos/evento', tipoController.getTipoEvento);

router.get('tipos/evento/:id', tipoController.getTipoEventoById);

// obtener todos los tipos de area
router.get('/tipos/area', tipoController.getAreas);

router.get('/tipos/area/:id', tipoController.getAreaById);
// obtener todos los tipos de ubicacion
router.get('/tipos/ubicacion', tipoController.getUbicaciones);

router.get('/tipos/ubicacion/:id', tipoController.getUbicacionById);

// actualizar tipo evento
router.patch('/tipos/evento/:id', verifyToken, checkRole(['administrador']), tipoController.updateTipoEvento);

// actualizar tipo area
router.patch('/tipos/area/:id', verifyToken, checkRole(['administrador']), tipoController.updateArea);

// actualizar tipo ubicacion
router.patch('/tipos/ubicacion/:id', verifyToken, checkRole(['administrador']), tipoController.updateUbicacion);

export default router;