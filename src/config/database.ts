import { Pool } from 'pg';
import dotenv from 'dotenv';

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "admin",
  database: "mydbpostgres",
  port: 5432,
});


/* user: process.env.DB_USER,
host: process.env.DB_HOST,
database: process.env.DB_NAME,
password: process.env.DB_PASSWORD,
port: parseInt(process.env.DB_PORT || '5432'), */


export default pool;