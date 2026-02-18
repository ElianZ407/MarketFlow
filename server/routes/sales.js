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

// Create Sale
router.post('/', async (req, res) => {
    const { total, metodo_pago, tel_cliente, details } = req.body;

    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // 1. Create Sale
        const [saleResult] = await connection.query(
            'INSERT INTO ventas (user_id, total, metodo_pago, tel_cliente) VALUES (?, ?, ?, ?)',
            [req.userId, total, metodo_pago, tel_cliente]
        );
        const saleId = saleResult.insertId;

        // 2. Create Sale Details & Update Stock
        for (const item of details) {
            await connection.query(
                'INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [saleId, item.producto_id, item.cantidad, item.precio_unitario]
            );

            await connection.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [item.cantidad, item.producto_id]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Venta registrada', id: saleId });

    } catch (error) {
        await connection.rollback();
        console.error('Sale error:', error);
        res.status(500).json({ message: 'Error al registrar venta' });
    } finally {
        connection.release();
    }
});

// GET /stats/daily - Ventas de los últimos 7 días
router.get('/stats/daily', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                DATE(fecha) as fecha, 
                SUM(total) as total 
            FROM ventas 
            WHERE user_id = ? 
            AND fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DATE(fecha) 
            ORDER BY fecha ASC
        `, [req.userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        res.status(500).json({ message: 'Error al obtener estadísticas diarias' });
    }
});

// GET /stats/top-products - Top 5 productos más vendidos
router.get('/stats/top-products', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                p.nombre, 
                SUM(dv.cantidad) as cantidad_total 
            FROM detalles_venta dv
            JOIN ventas v ON dv.venta_id = v.id
            JOIN productos p ON dv.producto_id = p.id
            WHERE v.user_id = ?
            GROUP BY p.id, p.nombre
            ORDER BY cantidad_total DESC
            LIMIT 5
        `, [req.userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching top products:', error);
        res.status(500).json({ message: 'Error al obtener productos más vendidos' });
    }
});

// GET /stats/payment-methods - Ventas por método de pago
router.get('/stats/payment-methods', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                metodo_pago, 
                COUNT(*) as cantidad 
            FROM ventas 
            WHERE user_id = ?
            GROUP BY metodo_pago
        `, [req.userId]);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        res.status(500).json({ message: 'Error al obtener métodos de pago' });
    }
});

module.exports = router;
