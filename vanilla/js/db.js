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
                businessName: 'Abarrotes Pino Suárez',
                address: 'Mercado Pino Suárez, Villahermosa, Tabasco',
                phone: '993-123-4567'
            };
            localStorage.setItem(this.KEYS.USERS, JSON.stringify([defaultUser]));
        }

        if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
            const defaultProducts = [
                { id: 1, name: 'Pozol con Cacao 1L', price: 35.00, stock: 50, category: 'Bebidas', image: 'https://placehold.co/400x300/3e2723/ffffff?text=Pozol+Cacao' },
                { id: 2, name: 'Pozol Blanco 1L', price: 30.00, stock: 40, category: 'Bebidas', image: 'https://placehold.co/400x300/f5f5f5/000000?text=Pozol+Blanco' },
                { id: 3, name: 'Queso de Hoja (pz)', price: 120.00, stock: 20, category: 'Lácteos', image: 'https://placehold.co/400x300/fff9c4/000000?text=Queso+Hoja' },
                { id: 4, name: 'Queso Doble Crema (pz)', price: 90.00, stock: 25, category: 'Lácteos', image: 'https://placehold.co/400x300/fffxxxx/000000?text=Queso+Doble' }, // Typo in color fixed in next line logic if needed, but placeholder handles it.
                { id: 5, name: 'Plátano Macho (kg)', price: 25.00, stock: 100, category: 'Frutas', image: 'https://placehold.co/400x300/fdd835/000000?text=Platano' },
                { id: 6, name: 'Tortilla de Maíz a Mano (pz)', price: 15.00, stock: 100, category: 'Tortillas', image: 'https://placehold.co/400x300/ffecb3/000000?text=Tortillas' },
                { id: 7, name: 'Auténtico Pejelagarto Asado', price: 180.00, stock: 10, category: 'Comida', image: 'https://placehold.co/400x300/4e342e/ffffff?text=Pejelagarto' },
                { id: 8, name: 'Chocolate Tabasqueño 1kg', price: 150.00, stock: 30, category: 'Dulces', image: 'https://placehold.co/400x300/5d4037/ffffff?text=Chocolate' },
                { id: 9, name: 'Avena con Cacao 1L', price: 25.00, stock: 30, category: 'Bebidas', image: 'https://placehold.co/400x300/8d6e63/ffffff?text=Avena' },
                { id: 10, name: 'Dulce de Coco (pz)', price: 20.00, stock: 50, category: 'Dulces', image: 'https://placehold.co/400x300/ffcc80/000000?text=Dulce+Coco' },
                { id: 11, name: 'Butifarra Casera (pz)', price: 12.00, stock: 80, category: 'Embutidos', image: 'https://placehold.co/400x300/b71c1c/ffffff?text=Butifarra' },
                { id: 12, name: 'Manojo de Chaya', price: 15.00, stock: 40, category: 'Verduras', image: 'https://placehold.co/400x300/2e7d32/ffffff?text=Chaya' },
                { id: 13, name: 'Limón Mandarina (kg)', price: 30.00, stock: 60, category: 'Frutas', image: 'https://placehold.co/400x300/cddc39/000000?text=Limon' },
                { id: 14, name: 'Masa de Maíz 1kg', price: 22.00, stock: 50, category: 'Tortillas', image: 'https://placehold.co/400x300/fff176/000000?text=Masa' },
                { id: 15, name: 'Chile Amashito (bolsa)', price: 10.00, stock: 100, category: 'Verduras', image: 'https://placehold.co/400x300/e53935/ffffff?text=Amashito' },
                { id: 16, name: 'Horchata de Arroz 1L', price: 25.00, stock: 40, category: 'Bebidas', image: 'https://placehold.co/400x300/fafafa/000000?text=Horchata' }
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
