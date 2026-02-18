const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
router.post('/register', async (req, res) => {
    const { email, password, nombreNegocio, telefono } = req.body;

    if (!email || !password || !nombreNegocio || !telefono) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    try {
        // Check if user exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User
        const [userResult] = await db.query(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [email, hashedPassword]
        );
        const userId = userResult.insertId;

        // Insert Profile
        await db.query(
            'INSERT INTO profiles (id, nombre_negocio, telefono_vendedor) VALUES (?, ?, ?)',
            [userId, nombreNegocio, telefono]
        );

        // Generate Token
        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.status(201).json({
            user: { id: userId, email },
            profile: { id: userId, nombre_negocio: nombreNegocio, telefono_vendedor: telefono },
            token
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña requeridos' });
    }

    try {
        // Find User
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        const user = users[0];

        // Verify Password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Get Profile
        const [profiles] = await db.query('SELECT * FROM profiles WHERE id = ?', [user.id]);
        const profile = profiles[0] || {};

        // Generate Token
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

        res.json({
            user: { id: user.id, email: user.email },
            profile,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
});

// Me
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const [users] = await db.query('SELECT id, email FROM users WHERE id = ?', [decoded.id]);
        const [profiles] = await db.query('SELECT * FROM profiles WHERE id = ?', [decoded.id]);

        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({
            user: users[0],
            profile: profiles[0] || {}
        });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido' });
    }
});

module.exports = router;
