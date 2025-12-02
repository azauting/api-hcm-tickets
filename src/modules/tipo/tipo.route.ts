import express from 'express';
import { tipoController } from './tipo.controller';
import { checkRole } from '../../middlewares/checkRole';
import { verifyToken } from '../../middlewares/verifyToken';

const router = express.Router();

// Create event type
router.post('/tipos/evento', verifyToken, checkRole(['administrador']), tipoController.createEventType);

// Create area
router.post('/tipos/area', verifyToken, checkRole(['administrador']), tipoController.createArea);

// Create location (ubicación)
// When creating a location, it must be assigned to an existing area
router.post('/tipos/ubicacion', verifyToken, checkRole(['administrador']), tipoController.createLocation);

// Get all event types
router.get('/tipos/evento', tipoController.getEventTypes);

router.get('/tipos/evento/:id', tipoController.getEventTypeById);

// Get all areas
router.get('/tipos/area', tipoController.getAreas);

router.get('/tipos/area/:id', tipoController.getAreaById);

// Get all locations
router.get('/tipos/ubicacion', tipoController.getLocations);

router.get('/tipos/ubicacion/:id', tipoController.getLocationById);

// Update event type
router.patch('/tipos/evento/:id', verifyToken, checkRole(['administrador']), tipoController.updateEventType);

// Update area
router.patch('/tipos/area/:id', verifyToken, checkRole(['administrador']), tipoController.updateArea);

// Update location
router.patch('/tipos/ubicacion/:id', verifyToken, checkRole(['administrador']), tipoController.updateLocation);

// Get unidad types
router.get('/tipos/unidad', verifyToken, checkRole(['administrador']), tipoController.getUnitTypes);

// Get estado types
router.get('/tipos/estado', verifyToken, checkRole(['administrador']), tipoController.getStatusTypes);

// Get prioridad types
router.get('/tipos/prioridad', verifyToken, checkRole(['administrador']), tipoController.getPriorityTypes);

// Get origen types
router.get('/tipos/origen', verifyToken, checkRole(['administrador']), tipoController.getOriginTypes);

export default router;
