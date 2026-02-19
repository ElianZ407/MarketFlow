/**
 * Inventory Logic with Tailwind Cards
 */

const inventory = {
    init() {
        this.renderGrid();

        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            this.renderGrid(e.target.value);
        });

        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProduct();
        });
    },

    renderGrid(search = '') {
        const products = DB.getProducts();
        const grid = document.getElementById('productGrid');
        grid.innerHTML = '';

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
        );

        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition';
            const imageSrc = p.image || `https://placehold.co/400x300?text=${encodeURIComponent(p.name)}`;

            card.innerHTML = `
                <div class="flex gap-4 mb-4">
                    <img src="${imageSrc}" class="w-16 h-16 rounded-lg object-cover bg-gray-100">
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h3 class="font-bold text-gray-800 truncate pr-2">${p.name}</h3>
                            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${p.category || 'General'}</span>
                        </div>
                        <div class="text-xl font-bold text-green-600">$${p.price.toFixed(2)}</div>
                        <div class="text-sm text-gray-500">Stock: ${p.stock}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button
                        onclick="inventory.editProduct(${p.id})"
                        class="flex-1 flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"
                    >
                        <i data-lucide="edit" class="w-4 h-4"></i> Editar
                    </button>
                    <button
                        onclick="inventory.deleteProduct(${p.id})"
                        class="flex-none bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition"
                    >
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });

        lucide.createIcons();
    },

    openModal(id = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        if (id) {
            // Edit
            const product = DB.getProducts().find(p => p.id === id);
            title.innerText = 'Editar Producto';
            document.getElementById('prodId').value = product.id;
            document.getElementById('prodName').value = product.name;
            document.getElementById('prodPrice').value = product.price;
            document.getElementById('prodStock').value = product.stock;
            document.getElementById('prodCategory').value = product.category;
            document.getElementById('prodImage').value = product.image || '';
        } else {
            // New
            title.innerText = 'Nuevo Producto';
            form.reset();
            document.getElementById('prodId').value = '';
        }
    },

    closeModal() {
        const modal = document.getElementById('productModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    },

    saveProduct() {
        const id = document.getElementById('prodId').value;
        const name = document.getElementById('prodName').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const stock = parseInt(document.getElementById('prodStock').value);
        const category = document.getElementById('prodCategory').value;
        const image = document.getElementById('prodImage').value;

        const product = {
            name, price, stock, category, image
        };

        if (id) {
            product.id = parseInt(id);
        }

        DB.saveProduct(product);
        this.closeModal();
        this.renderGrid();
    },

    editProduct(id) {
        this.openModal(id);
    },

    deleteProduct(id) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            DB.deleteProduct(id);
            this.renderGrid();
        }
    }
};

inventory.init();
