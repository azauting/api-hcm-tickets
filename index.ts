import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './db.config';
import userRoutes from './src/routes/user.route';
import authRoutes from './src/routes/auth.route';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// CORS: permitir el frontend (ajusta FRONTEND_ORIGIN en tu .env)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:4200';
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: false // como usas Authorization header, no necesitas cookies
}));

app.use(express.json());


import bcrypt from 'bcryptjs';
const hashPasswords = async () => {
    const [result] = await db.query('SELECT usuario_id, contrasena FROM usuario');
    const users = result as { usuario_id: number; contrasena: string; }[];

    for (const user of users) {
        if (user.contrasena.length === 60) continue;

        const hashedPassword = await bcrypt.hash(user.contrasena, 10);
        await db.query('UPDATE usuario SET contrasena = ? WHERE usuario_id = ?', [hashedPassword, user.usuario_id]);
        console.log(`Contraseña del usuario ${user.usuario_id} hasheada y actualizada.`);
    }
};
// Descomentar solo si es necesario, o si se agregan nuevos usuarios con contraseñas sin hash
// hashPasswords();

// ruta para test de funcionamiento
app.get('/', (req, res) => {
    res.send('api-hospital-v1 funcionando correctamente');
});
// rutas de usuario
app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);

const startServer = async () => {
    try {
        // Verificamos la conexión a la base de datos antes de iniciar el servidor
        const conn = await db.getConnection();
        // Iniciamos el servidor
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
            console.log(`CORS allowed origin: ${FRONTEND_ORIGIN}`);
        });
        // Liberamos la conexión a la base de datos
        conn.release();
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // salir si DB falla
    }
};

startServer();
