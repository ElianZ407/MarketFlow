/**
 * Layout Script to inject Sidebar and Navbar
 */

const Layout = {
    init() {
        const user = Auth.getUser();
        const activePath = window.location.pathname.split('/').pop() || 'pos.html';

        const body = document.body;
        body.className = "bg-gray-50 min-h-screen md:flex";

        // Create Sidebar HTML
        const sidebarHTML = `
            <!-- Mobile Header -->
            <div class="md:hidden bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
                <h1 class="font-bold text-xl">MarketFlow</h1>
                <button onclick="Auth.logout()"><i data-lucide="log-out" class="w-6 h-6"></i></button>
            </div>

            <!-- Desktop Sidebar -->
            <div class="hidden md:flex flex-col w-64 bg-green-700 text-white min-h-screen p-4 fixed left-0 top-0 bottom-0 z-10">
                <h1 class="font-bold text-2xl mb-8">MarketFlow</h1>
                <div class="flex-1 space-y-4">
                    <a href="pos.html" class="flex items-center gap-3 p-3 rounded-lg transition ${activePath === 'pos.html' ? 'bg-green-800 text-white' : 'hover:bg-green-600 text-green-100'}">
                        <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                        <span>Punto de Venta</span>
                    </a>
                    <a href="inventory.html" class="flex items-center gap-3 p-3 rounded-lg transition ${activePath === 'inventory.html' ? 'bg-green-800 text-white' : 'hover:bg-green-600 text-green-100'}">
                        <i data-lucide="store" class="w-5 h-5"></i>
                        <span>Inventario</span>
                    </a>
                    <a href="dashboard.html" class="flex items-center gap-3 p-3 rounded-lg transition ${activePath === 'dashboard.html' ? 'bg-green-800 text-white' : 'hover:bg-green-600 text-green-100'}">
                        <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                        <span>Panel de Ventas</span>
                    </a>
                </div>
                <div class="pt-4 border-t border-green-600">
                    <p class="text-sm mb-2">${user ? user.businessName : 'Mi Negocio'}</p>
                    <button onclick="Auth.logout()" class="flex items-center gap-2 text-green-200 hover:text-white transition w-full">
                        <i data-lucide="log-out" class="w-5 h-5"></i> Salir
                    </button>
                </div>
            </div>

            <!-- Mobile Bottom Nav -->
            <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
                <a href="pos.html" class="flex flex-col items-center gap-1 ${activePath === 'pos.html' ? 'text-green-600' : 'text-gray-500'}">
                    <i data-lucide="shopping-cart" class="w-5 h-5"></i>
                    <span class="text-xs">Venta</span>
                </a>
                <a href="inventory.html" class="flex flex-col items-center gap-1 ${activePath === 'inventory.html' ? 'text-green-600' : 'text-gray-500'}">
                    <i data-lucide="store" class="w-5 h-5"></i>
                    <span class="text-xs">Inventario</span>
                </a>
                <a href="dashboard.html" class="flex flex-col items-center gap-1 ${activePath === 'dashboard.html' ? 'text-green-600' : 'text-gray-500'}">
                    <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
                    <span class="text-xs">Reportes</span>
                </a>
            </div>
        `;

        // Prepend sidebar logic
        const sidebarDiv = document.createElement('div');
        sidebarDiv.innerHTML = sidebarHTML;
        body.insertBefore(sidebarDiv, body.firstChild);

        // Adjust Main Content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.className = "flex-1 p-4 md:p-8 overflow-y-auto md:ml-64 mb-16 md:mb-0";
        }

        // Init Icons
        lucide.createIcons();
    }
};

// Autoinit if authenticated
if (Auth.getUser()) {
    Layout.init();
}
