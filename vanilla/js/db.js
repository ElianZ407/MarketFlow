/**
 * Simple Database Wrapper using LocalStorage
 * Manages: users, products, sales
 */

const DB = {
    // Keys
    KEYS: {
        USERS: 'market_users',
        PRODUCTS: 'market_products',
        SALES: 'market_sales',
        SESSION: 'market_session'
    },

    // Initialize with default data if empty
    init() {
        if (!localStorage.getItem(this.KEYS.USERS)) {
            const defaultUser = {
                id: 1,
                name: 'Admin User',
                email: 'admin@market.com',
                password: 'admin', // In real app, hash this
                businessName: 'Mi Tiendita',
                phone: '555-123-4567'
            };
            localStorage.setItem(this.KEYS.USERS, JSON.stringify([defaultUser]));
        }

        if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
            const defaultProducts = [
                { id: 1, name: 'Coca Cola 600ml', price: 18.00, stock: 50, category: 'Bebidas' },
                { id: 2, name: 'Sabritas Sal 45g', price: 16.00, stock: 30, category: 'Botanas' },
                { id: 3, name: 'Galletas Emperador', price: 14.00, stock: 40, category: 'Galletas' },
                { id: 4, name: 'Agua Ciel 1L', price: 12.00, stock: 60, category: 'Bebidas' },
            ];
            localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(defaultProducts));
        }

        if (!localStorage.getItem(this.KEYS.SALES)) {
            localStorage.setItem(this.KEYS.SALES, JSON.stringify([]));
        }
    },

    // Generic Get
    getAll(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    // Generic Save
    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Users
    getUsers() { return this.getAll(this.KEYS.USERS); },
    addUser(user) {
        const users = this.getUsers();
        user.id = Date.now();
        users.push(user);
        this.save(this.KEYS.USERS, users);
        return user;
    },

    // Products
    getProducts() { return this.getAll(this.KEYS.PRODUCTS); },
    saveProduct(product) {
        const products = this.getProducts();
        if (product.id) {
            // Edit
            const index = products.findIndex(p => p.id === product.id);
            if (index !== -1) products[index] = product;
        } else {
            // Add
            product.id = Date.now();
            products.push(product);
        }
        this.save(this.KEYS.PRODUCTS, products);
    },
    deleteProduct(id) {
        const products = this.getProducts().filter(p => p.id !== id);
        this.save(this.KEYS.PRODUCTS, products);
    },

    // Sales
    getSales() { return this.getAll(this.KEYS.SALES); },
    addSale(sale) {
        const sales = this.getSales();
        sale.id = Date.now();
        sale.date = new Date().toISOString();
        sales.push(sale);
        this.save(this.KEYS.SALES, sales);

        // Update Stock
        const products = this.getProducts();
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.stock -= item.quantity;
            }
        });
        this.save(this.KEYS.PRODUCTS, products);

        return sale;
    }
};

// Initialize on load
DB.init();
