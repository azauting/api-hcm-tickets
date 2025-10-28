import express from 'express';
import { login } from '../controllers/auth.controller';

const router = express.Router();

// Rutas de autenticación 
router.post('/login', login);

export default router;