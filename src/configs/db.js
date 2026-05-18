import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const config = {
  host     : process.env.DB_HOST,
  database : process.env.DB_NAME,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  port     : process.env.DB_PORT,
  ssl      : { rejectUnauthorized: false } // requerido por Supabase
};

const pool = new Pool(config);

pool.connect()
  .then(() => {
    console.log("✅ Conectado a PostgreSQL");
  })
  .catch((err) => {
    console.error("❌ Error de conexión:", err.message);
  });

export default pool;
