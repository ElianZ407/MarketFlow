const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
};

router.use(verifyToken);

// Get all products for user
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM productos WHERE user_id = ?', [req.userId]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// Add product
router.post('/', async (req, res) => {
    const { nombre, precio, stock, categoria } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO productos (user_id, nombre, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)',
            [req.userId, nombre, precio, stock, categoria]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto' });
    }
});

// Update product
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, precio, stock, categoria } = req.body;
    try {
        await db.query(
            'UPDATE productos SET nombre = ?, precio = ?, stock = ?, categoria = ? WHERE id = ? AND user_id = ?',
            [nombre, precio, stock, categoria, id, req.userId]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM productos WHERE id = ? AND user_id = ?', [id, req.userId]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

module.exports = router;
