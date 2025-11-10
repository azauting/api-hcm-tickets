import express from 'express';
import { verifyToken } from '../../middlewares/verifyToken';

const router = express.Router();


// ruta para crear un nuevo ticket 
router.post('/tickets', verifyToken)
// ruta para obtener un ticket por ID
router.get('/tickets/:id', verifyToken)
// ruta para obtener todos los tickets
router.get('/tickets', verifyToken)
// ruta para actualizar un ticket por ID
router.put('/tickets/:id', verifyToken)
// 

export default router;