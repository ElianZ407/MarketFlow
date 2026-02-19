/**
 * POS Logic with Tailwind CSS
 */

const pos = {
    cart: [],
    products: [],
    paymentMethod: 'Efectivo',

    init() {
        this.loadProducts();
        this.renderProducts();

        // Search Listener
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            this.renderProducts(e.target.value);
        });
    },

    loadProducts() {
        this.products = DB.getProducts();
    },

    renderProducts(search = '') {
        const grid = document.getElementById('productGrid');
        grid.innerHTML = '';

        const filtered = this.products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) && p.stock > 0
        );

        filtered.forEach(p => {
            const card = document.createElement('div');
            // Tailwind Classes
            card.className = 'bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:border-green-500 hover:shadow-md transition group';
            card.onclick = () => this.addToCart(p);
            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800 truncate">${p.name}</h3>
                </div>
                <p class="text-green-600 font-bold text-xl">$${p.price.toFixed(2)}</p>
                <p class="text-xs text-gray-400 mt-1">Stock: ${p.stock}</p>
            `;
            grid.appendChild(card);
        });
    },

    addToCart(product) {
        const existing = this.cart.find(i => i.id === product.id);

        if (existing) {
            if (existing.quantity < product.stock) {
                existing.quantity++;
            } else {
                alert('Stock insuficiente');
            }
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.renderCart();
    },

    removeFromCart(id) {
        this.cart = this.cart.filter(i => i.id !== id);
        this.renderCart();
    },

    updateQuantity(id, delta) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            const product = this.products.find(p => p.id === id);
            const newQty = item.quantity + delta;

            if (newQty > 0 && newQty <= product.stock) {
                item.quantity = newQty;
            } else if (newQty <= 0) {
                this.removeFromCart(id);
                return;
            }
        }
        this.renderCart();
    },

    renderCart() {
        const container = document.getElementById('cartItems');
        const totalDisplay = document.getElementById('cartTotal');

        if (this.cart.length === 0) {
            container.innerHTML = '<div class="text-center text-gray-400 mt-10">Carrito vacío</div>';
            totalDisplay.innerText = '$0.00';
            this.calculateChange();
            return;
        }

        container.innerHTML = '';
        let total = 0;

        this.cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const row = document.createElement('div');
            row.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg';
            row.innerHTML = `
                <div class="flex-1">
                    <h4 class="font-medium text-sm text-gray-800">${item.name}</h4>
                    <p class="text-xs text-gray-500">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="pos.updateQuantity(${item.id}, -1)" class="p-1 hover:bg-gray-200 rounded"><i data-lucide="minus" class="w-4 h-4"></i></button>
                    <span class="w-6 text-center font-bold text-sm">${item.quantity}</span>
                    <button onclick="pos.updateQuantity(${item.id}, 1)" class="p-1 hover:bg-gray-200 rounded"><i data-lucide="plus" class="w-4 h-4"></i></button>
                    <button onclick="pos.removeFromCart(${item.id})" class="text-red-500 p-1 hover:bg-red-50 rounded"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            `;
            container.appendChild(row);
        });

        lucide.createIcons();
        totalDisplay.innerText = `$${total.toFixed(2)}`;
        this.calculateChange();
    },

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    setPaymentMethod(method) {
        this.paymentMethod = method;
        document.querySelectorAll('.payment-btn').forEach(b => {
            if (b.dataset.method === method) {
                b.className = 'payment-btn flex justify-center py-2 rounded border bg-green-600 text-white border-green-600';
            } else {
                b.className = 'payment-btn flex justify-center py-2 rounded border bg-white text-gray-700 hover:bg-gray-100';
            }
        });
    },

    calculateChange() {
        const total = this.getTotal();
        const cashInput = document.getElementById('cashGiven');
        const changeDisplay = document.getElementById('changeDisplay');

        const cash = parseFloat(cashInput.value) || 0;
        const change = cash - total;

        if (change >= 0) {
            changeDisplay.innerText = `$${change.toFixed(2)}`;
            changeDisplay.className = 'text-green-600 font-bold';
        } else {
            changeDisplay.innerText = 'Falta dinero';
            changeDisplay.className = 'text-red-500 font-bold';
        }
    },

    checkout() {
        if (this.cart.length === 0) {
            alert('Carrito vacío');
            return;
        }

        const total = this.getTotal();
        const cash = parseFloat(document.getElementById('cashGiven').value) || 0;

        if (this.paymentMethod === 'Efectivo' && cash < total) {
            alert('El monto en efectivo es insuficiente');
            return;
        }

        const sale = {
            total: total,
            paymentMethod: this.paymentMethod,
            items: [...this.cart],
            cashGiven: cash || total,
            change: (cash - total) > 0 ? (cash - total) : 0
        };

        const savedSale = DB.addSale(sale);
        this.printTicket(savedSale);

        this.cart = [];
        this.renderCart();
        document.getElementById('cashGiven').value = '';
        this.loadProducts();
        this.renderProducts();
    },

    printTicket(sale) {
        const area = document.getElementById('ticket-print-area');
        const user = Auth.getUser();
        const date = new Date(sale.date).toLocaleString();

        let itemsHtml = '';
        sale.items.forEach(item => {
            itemsHtml += `
                <div style="display: flex; margin-bottom: 5px;">
                    <span style="width: 30px;">${item.quantity}</span>
                    <span style="flex: 1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${item.name}</span>
                    <span style="width: 50px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        });

        area.innerHTML = `
            <div style="font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 10px; background: white;">
                <div style="text-align: center; margin-bottom: 10px;">
                    <h2 style="font-size: 16px; margin: 0; font-weight: bold;">${user.businessName || 'MarketFlow'}</h2>
                    <p style="margin: 0;">${user.phone || ''}</p>
                </div>
                
                <div style="border-bottom: 1px dashed black; padding-bottom: 5px; margin-bottom: 5px;">
                    <p style="margin:0;">Fecha: ${date}</p>
                    <p style="margin:0;">Ticket #: ${sale.id.toString().slice(-6)}</p>
                </div>

                <div style="font-weight: bold; display: flex; border-bottom: 1px solid black; margin-bottom: 5px;">
                    <span style="width: 30px;">Can</span>
                    <span style="flex: 1;">Desc</span>
                    <span style="width: 50px; text-align: right;">Imp</span>
                </div>

                <div style="border-bottom: 1px dashed black; margin-bottom: 10px; padding-bottom: 5px;">
                    ${itemsHtml}
                </div>

                <div style="text-align: right;">
                    <div style="font-weight: bold; font-size: 14px;">TOTAL: $${sale.total.toFixed(2)}</div>
                    <div>Pago (${sale.paymentMethod}): $${sale.cashGiven.toFixed(2)}</div>
                    <div>Cambio: $${sale.change.toFixed(2)}</div>
                </div>

                <div style="text-align: center; margin-top: 15px; border-top: 1px dashed black; padding-top: 5px;">
                    <p style="margin:0; font-weight: bold;">¡GRACIAS POR SU COMPRA!</p>
                </div>
            </div>
        `;

        window.print();
    }
};

pos.init();
