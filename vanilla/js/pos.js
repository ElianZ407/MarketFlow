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
            card.className = 'bg-white p-4 rounded-xl shadow-sm border cursor-pointer hover:border-green-500 hover:shadow-md transition group flex flex-col gap-2';
            card.onclick = () => this.addToCart(p);

            const imageSrc = p.image || `https://placehold.co/400x300?text=${encodeURIComponent(p.name)}`;

            card.innerHTML = `
                <div class="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img src="${imageSrc}" alt="${p.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                </div>
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-gray-800 truncate text-sm">${p.name}</h3>
                </div>
                <div class="flex justify-between items-center mt-auto">
                    <p class="text-green-600 font-bold text-lg">$${p.price.toFixed(2)}</p>
                    <p class="text-xs text-gray-400">Stock: ${p.stock}</p>
                </div>
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

        const contactInput = document.getElementById('customerContact').value.trim();

        const sale = {
            total: total,
            paymentMethod: this.paymentMethod,
            items: [...this.cart],
            cashGiven: cash || total,
            change: (cash - total) > 0 ? (cash - total) : 0,
            customerContact: contactInput
        };

        const savedSale = DB.addSale(sale);
        this.printTicket(savedSale);

        this.cart = [];
        this.renderCart();
        document.getElementById('cashGiven').value = '';
        document.getElementById('customerContact').value = '';
        this.loadProducts();
        this.renderProducts();
    },

    printTicket(sale) {
        const user = Auth.getUser();
        const date = new Date(sale.date).toLocaleString();

        let itemsHtml = '';
        sale.items.forEach(item => {
            const itemTotal = (item.price * item.quantity).toFixed(2);
            itemsHtml += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                    <div style="display: flex;">
                        <span style="width: 20px;">${item.quantity}</span>
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 45mm;">${item.name}</span>
                    </div>
                    <span>$${itemTotal}</span>
                </div>
            `;
        });

        // Content
        const content = `
            <div style="
                font-family: 'Courier New', Courier, monospace; 
                width: 70mm;
                margin: 0 auto;
                font-size: 12px; 
                background: white; 
                color: black;
                padding: 10px 0;
            ">
                <!-- ENTITY HEADER -->
                <div style="text-align: center; margin-bottom: 10px;">
                    <h2 style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase;">${user.businessName || 'MARKETFLOW POS'}</h2>
                    <p style="margin: 2px 0;">${user.address || 'Calle Falsa 123, Ciudad'}</p>
                    <p style="margin: 0;">Tel: ${user.phone || '555-0123'}</p>
                </div>

                <!-- INFO -->
                <div style="margin-bottom: 5px;">
                    <p style="margin: 0;">Fecha: ${date}</p>
                    <p style="margin: 0;">Ticket #: ${String(sale.id).slice(-5)}</p>
                </div>

                <div style="border-top: 1px dashed black; margin: 5px 0;"></div>

                <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 5px;">
                    <span>Cant Desc</span>
                    <span>Importe</span>
                </div>

                <div style="margin-bottom: 5px;">
                    ${itemsHtml}
                </div>

                <div style="border-top: 1px dashed black; margin: 5px 0;"></div>

                <div style="text-align: right; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 2px;">
                        <span>TOTAL:</span>
                        <span>$${sale.total.toFixed(2)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                        <span>Pago (${sale.paymentMethod}):</span>
                        <span>$${sale.cashGiven.toFixed(2)}</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between;">
                        <span>Cambio:</span>
                        <span>$${sale.change.toFixed(2)}</span>
                    </div>
                </div>

                <div style="border-top: 1px dashed black; margin: 5px 0;"></div>

                <div style="text-align: center; margin-top: 10px;">
                    <p style="margin: 2px 0; font-weight: bold;">¡GRACIAS POR SU COMPRA!</p>
                </div>
            </div>
        `;

        // Create temporary element
        const element = document.createElement('div');
        element.innerHTML = content;
        element.style.position = 'fixed';
        element.style.left = '-9999px';
        element.style.top = '0';
        element.style.width = '80mm';
        element.style.background = 'white';
        // Ensure z-index is high enough just in case, though off-screen matters more
        element.style.zIndex = '9999';
        document.body.appendChild(element);

        // PDF Options
        const opt = {
            margin: 1,
            filename: `ticket-${sale.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, logging: false, useCORS: true },
            jsPDF: { unit: 'mm', format: [80, 297], orientation: 'portrait' }
        };

        // Download
        html2pdf().set(opt).from(element).output('blob').then((blob) => {
            // Prepare Text Summary for Digital Sending
            let textCheck = `*TICKET #${sale.id}*\n`;
            textCheck += `📅 ${date}\n\n`;
            textCheck += `*ITEMS:*\n`;

            sale.items.forEach(i => {
                textCheck += `${i.quantity}x ${i.name} - $${(i.price * i.quantity).toFixed(2)}\n`;
            });

            textCheck += `\n*TOTAL: $${sale.total.toFixed(2)}*\n`;
            textCheck += `Pago: $${sale.cashGiven.toFixed(2)} (${sale.paymentMethod})\n`;
            textCheck += `Cambio: $${sale.change.toFixed(2)}\n`;
            textCheck += `\n¡Gracias por su compra! 🛒`;

            const contact = sale.customerContact || '';

            if (contact.includes('@')) {
                // EMAIL
                const mailtoLink = `mailto:${contact}?subject=Ticket de Compra #${sale.id}&body=${encodeURIComponent(textCheck)}`;
                window.open(mailtoLink, '_blank');
            } else if (contact.length > 0) {
                // PHONE -> WHATSAPP WEB DIRECTLY
                // Strip non-numeric chars to prevent errors
                const phone = contact.replace(/\D/g, '');
                const waLink = `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(textCheck)}`;
                window.open(waLink, '_blank');
            }

            // ALWAYS DOWNLOAD PDF (The "Action")
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ticket-${sale.id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(element);
        });
    },

    reprintLast() {
        const sales = DB.getSales();
        if (sales.length > 0) {
            const lastSale = sales[sales.length - 1];
            this.printTicket(lastSale);
        } else {
            alert('No hay ventas recientes para imprimir.');
        }
    }
};

pos.init();
