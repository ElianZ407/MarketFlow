
import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import api from '../lib/api';

const SalesDashboard = () => {
    const [dailySales, setDailySales] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [dailyRes, topRes, paymentsRes] = await Promise.all([
                    api.get('/sales/stats/daily'),
                    api.get('/sales/stats/top-products'),
                    api.get('/sales/stats/payment-methods')
                ]);

                // Format dates for display
                const formattedDaily = dailyRes.data.map(item => ({
                    ...item,
                    fecha: new Date(item.fecha).toLocaleDateString()
                }));

                setDailySales(formattedDaily);
                setTopProducts(topRes.data);
                setPaymentMethods(paymentsRes.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (loading) {
        return <div className="p-8 text-center">Cargando estadísticas...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Panel de Ventas</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Daily Sales Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Ventas Diarias (Últimos 7 días)</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailySales}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="fecha" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" name="Ventas ($)" fill="#4f46e5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payment Methods Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Métodos de Pago</h2>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentMethods}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="cantidad"
                                >
                                    {paymentMethods.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Top 5 Productos Más Vendidos</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad Vendida</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topProducts.map((product, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{product.cantidad_total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesDashboard;
