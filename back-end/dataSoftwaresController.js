import pool from './database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { verifyToken } from './authMiddleware.js';

export const getSoftwares = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM softwares ORDER BY ID ASC',
        )
        res.status(200).json(result.rows);
    }
        catch (error) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
        }
    };
        