import mysql from 'mysql2/promise';


// Configuracion de la conexion a la base de datos
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    queueLimit: 50,
    waitForConnections: true
});

export default pool;