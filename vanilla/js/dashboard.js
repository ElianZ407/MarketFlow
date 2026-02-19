/**
 * Dashboard Logic with Tailwind
 */

const dashboard = {
    sales: [],

    init() {
        this.sales = DB.getSales();
        this.renderStats();
        this.renderCharts();
        this.renderTopProducts();
    },

    getTodaySales() {
        // Handle Timezone or generic date string
        const today = new Date().toISOString().split('T')[0];
        return this.sales.filter(s => s.date.startsWith(today));
    },

    renderStats() {
        const todaySales = this.getTodaySales();
        const totalToday = todaySales.reduce((sum, s) => sum + s.total, 0);

        const totalItems = todaySales.reduce((sum, s) => {
            return sum + s.items.reduce((is, i) => is + i.quantity, 0);
        }, 0);

        const avg = todaySales.length > 0 ? totalToday / todaySales.length : 0;

        document.getElementById('todaySales').innerText = `$${totalToday.toFixed(2)}`;
        document.getElementById('totalItems').innerText = totalItems;
        document.getElementById('avgTicket').innerText = `$${avg.toFixed(2)}`;
    },

    renderCharts() {
        // Daily Sales Logic
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const dataDaily = last7Days.map(date => {
            const daySales = this.sales.filter(s => s.date.startsWith(date));
            return daySales.reduce((sum, s) => sum + s.total, 0);
        });

        // Daily Chart
        new Chart(document.getElementById('dailyChart'), {
            type: 'bar',
            data: {
                labels: last7Days,
                datasets: [{
                    label: 'Ventas ($)',
                    data: dataDaily,
                    backgroundColor: '#4f46e5',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Payment Methods Logic
        const methods = {};
        this.sales.forEach(s => {
            methods[s.paymentMethod] = (methods[s.paymentMethod] || 0) + 1;
        });

        // Payment Chart
        new Chart(document.getElementById('paymentChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(methods),
                datasets: [{
                    data: Object.values(methods),
                    backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#6366f1']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    renderTopProducts() {
        const productStats = {};

        this.sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productStats[item.name]) {
                    productStats[item.name] = { qty: 0, total: 0 };
                }
                productStats[item.name].qty += item.quantity;
                productStats[item.name].total += (item.price * item.quantity);
            });
        });

        const sorted = Object.entries(productStats)
            .sort(([, a], [, b]) => b.qty - a.qty)
            .slice(0, 5);

        const tbody = document.getElementById('topProductsBody');
        tbody.innerHTML = '';

        sorted.forEach(([name, stats]) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${stats.qty}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold text-right">$${stats.total.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    }
};

dashboard.init();
