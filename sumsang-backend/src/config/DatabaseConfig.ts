import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.PORT || '5432'),
    ssl: process.env.USE_TEST_ENDPOINTS === 'true' ? false : { rejectUnauthorized: false },
});

export default db;
