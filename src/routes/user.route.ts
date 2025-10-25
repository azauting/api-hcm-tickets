import express from 'express';
// importamos los controladores
import { getUserId } from '../controllers/user.controller';

// inicializamos el router
const router = express.Router();


// Ruta de usuario para obtener información del usuario especificado por ID
router.get('/users/:id', getUserId);

export default router;