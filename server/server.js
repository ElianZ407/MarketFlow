const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/sales', require('./routes/sales'));

// Root route
app.get('/', (req, res) => {
    res.send('MarketFlow API is running');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
