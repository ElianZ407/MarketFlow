const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    console.log('Connected to MySQL server...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');

    try {
        await connection.query(schema);
        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await connection.end();
    }
}

initDB();
