// src/pages/DashboardPage.jsx

import React from 'react';
import { FaChartBar, FaTag, FaStar, FaDollarSign } from 'react-icons/fa';

// Datos de ejemplo
const summaryData = [
    { title: "Compras del Mes", value: "12", icon: <FaChartBar />, color: "text-blue-500" },
    { title: "Productos Favoritos", value: "3", icon: <FaStar />, color: "text-yellow-500" },
];

const categoriesData = [
    { name: "Almacén", value: "$ 4.500", icon: <FaTag />, color: "text-green-500" },
    { name: "Bebidas", value: "$ 2.800", icon: <FaTag />, color: "text-red-500" },
    { name: "Limpieza", value: "$ 1.200", icon: <FaTag />, color: "text-purple-500" },
];

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Mis Dashboards</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Columna Izquierda: Resumen de Actividad */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Resumen de Actividad</h2>
                    <div className="space-y-4">
                        {summaryData.map((item) => (
                            <div key={item.title} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                <div className={`mr-4 text-2xl ${item.color}`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <p className="text-gray-600">{item.title}</p>
                                    <p className="text-2xl font-bold text-gray-800">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Columna Derecha: Gastos por Categoría */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Gastos por Categoría</h2>
                    <div className="space-y-4">
                        {categoriesData.map((cat) => (
                            <div key={cat.name} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className={`mr-3 text-lg ${cat.color}`}>
                                        {cat.icon}
                                    </div>
                                    <p className="text-gray-800 font-semibold">{cat.name}</p>
                                </div>
                                <p className="font-bold text-gray-800">{cat.value}</p>
                            </div>
                        ))}
                         <div className="text-right mt-4 pt-4 border-t">
                            <p className="text-gray-600">Total Gastado</p>
                            <p className="text-2xl font-bold text-green-600">$ 8.500</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}