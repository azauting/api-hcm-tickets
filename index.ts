// index.ts — entrada de la app
import 'dotenv/config'; // <-- debe ser la PRIMERA línea en runtime
import express from 'express';
import cors from 'cors';
import db from './src/config/db.config';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

import userRoutes from './src/modules/user/user.route';
import authRoutes from './src/modules/auth/auth.route';
import ticketRoutes from './src/modules/ticket/ticket.route';
import ticketLogRoutes from './src/modules/ticketLog/ticketLog.route';


const app = express();

// PORT seguro: parsea y da fallback
const port = Number(process.env.PORT ?? 3000);



app.use(helmet());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            objectSrc: ["'none'"],
        },
    })
);

// Debug temporal: confirmar que Railway inyectó las env vars
console.log('ENV CHECK — JWT_SECRET exists?', Boolean(process.env.JWT_SECRET));
console.log('ENV CHECK — NODE_ENV:', process.env.NODE_ENV);

// CORS: permitir el frontend (ajusta FRONTEND_ORIGIN en tu .env)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN
app.use(cookieParser());

app.use(
    cors({
        origin: FRONTEND_ORIGIN,
        credentials: true, // si usas cookies o auth headers 
    })
);

app.use(express.json());

// Descomentar solo si es necesario (NO en cada arranque)
// const hashPasswords = async () => {
//     const [result] = await db.query('SELECT usuario_id, contrasena FROM usuario');
//     const users = result as { usuario_id: number; contrasena: string; }[];

//     for (const user of users) {
//         if (user.contrasena.length === 60) continue;

//         const hashedPassword = await bcrypt.hash(user.contrasena, 10);
//         await db.query('UPDATE usuario SET contrasena = ? WHERE usuario_id = ?', [hashedPassword, user.usuario_id]);
//         console.log(`Contraseña del usuario ${user.usuario_id} hasheada y actualizada.`);
//     }
// };

// rutas
app.get('/', (req, res) => res.send('api-hospital-v1 funcionando correctamente'));
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', ticketLogRoutes);
app.use('/api', ticketRoutes);

const startServer = async () => {
    try {
        // Verificamos la conexión a la base de datos antes de iniciar el servidor
        const conn = await db.getConnection();
        conn.release();

        app.listen(port, () => {
            console.log(`Servidor corriendo en :${port}`);
            console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`);
        });
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // salir si DB falla
    }
};

startServer();
