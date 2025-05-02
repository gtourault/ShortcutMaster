import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database.js';
import authRoutes from './authroute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur connexion DB');
    }
});


app.get('/', (req, res) => {
    res.send('API is running 🎉');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
