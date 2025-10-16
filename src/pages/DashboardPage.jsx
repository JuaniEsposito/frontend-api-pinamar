// src/pages/AdminPanelPage.jsx (SIN ENCABEZADO)

import React, { useState, useEffect } from 'react';
// Importaciones de íconos para las estadísticas
import { FaChartBar, FaTag, FaStar, FaDollarSign } from 'react-icons/fa';

// --- Datos de Ejemplo para el Resumen y Gráficos ---
const summaryStats = [
    { title: "Órdenes Pendientes", value: "12", icon: <FaChartBar />, color: "text-blue-500", detail: "Pendientes de envío" },
    { title: "Nuevos Productos (Mes)", value: "3", icon: <FaStar />, color: "text-yellow-500", detail: "En lo que va del mes" },
    { title: "Total de Ventas (Hoy)", value: "$ 1.500", icon: <FaDollarSign />, color: "text-green-500", detail: "Ingresos del día" },
];

const categorySales = [
    { name: "Panadería", value: "$ 4.500", icon: <FaTag />, color: "text-indigo-500" },
    { name: "Lácteos", value: "$ 2.800", icon: <FaTag />, color: "text-teal-500" },
    { name: "Frutas y Verduras", value: "$ 1.200", icon: <FaTag />, color: "text-orange-500" },
];


// --- Componentes Reutilizables ---

/**
 * Componente Tarjeta base con título y botón de acción.
 */
const Card = ({ title, buttonText, children, onButtonClick }) => (
    <div className="bg-card-light dark:bg-card-dark rounded-xl shadow-lg p-6 transition-colors duration-300 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">{title}</h2>
            {buttonText && (
                <button
                    onClick={onButtonClick}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-opacity-90 transition transform hover:scale-[1.02] shadow-md"
                >
                    <span className="material-icons text-lg">add</span>
                    <span>{buttonText}</span>
                </button>
            )}
        </div>
        <div className="space-y-4 flex-grow">
            {children}
        </div>
    </div>
);

/**
 * Componente para mostrar un Producto dentro de la lista de administración.
 */
const ProductItem = ({ name, category, imgSrc, imgAlt }) => (
    <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
        <div className="flex items-center space-x-4">
            <img alt={imgAlt} className="w-16 h-16 object-cover rounded-md flex-shrink-0" src={imgSrc} />
            <div>
                <p className="font-semibold text-text-light dark:text-text-dark">{name}</p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">{category}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button
                aria-label={`Editar producto ${name}`}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-subtle-light dark:text-subtle-dark transition-colors"
            >
                <span className="material-icons text-base">edit</span>
            </button>
            <button
                aria-label={`Eliminar producto ${name}`}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
            >
                <span className="material-icons text-base">delete</span>
            </button>
        </div>
    </div>
);

/**
 * Componente para mostrar una Categoría dentro de la lista de administración.
 */
const CategoryItem = ({ name }) => (
    <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
        <p className="font-semibold text-text-light dark:text-text-dark">{name}</p>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button
                aria-label={`Editar categoría ${name}`}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-subtle-light dark:text-subtle-dark transition-colors"
            >
                <span className="material-icons text-base">edit</span>
            </button>
            <button
                aria-label={`Eliminar categoría ${name}`}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
            >
                <span className="material-icons text-base">delete</span>
            </button>
        </div>
    </div>
);

/**
 * Componente para mostrar una estadística resumida.
 */
const StatCard = ({ title, value, icon, color, detail }) => (
    <div className="flex items-center p-4 bg-card-light dark:bg-card-dark rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className={`mr-4 text-3xl ${color} flex-shrink-0`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-subtle-light dark:text-subtle-dark">{title}</p>
            <p className="text-2xl font-bold text-text-light dark:text-text-dark">{value}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{detail}</p>
        </div>
    </div>
);

// --- Componente Principal ---

const AdminPanelPage = () => {
    // La lógica del tema (isDark, useEffects, toggleTheme) se mantiene
    // para que la funcionalidad de modo oscuro/claro funcione en la página,
    // incluso sin el botón visible en el encabezado.
    const [isDark, setIsDark] = useState(null);

    // Lógica del tema (Inicialización)
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        setIsDark(initialDark);
    }, []);

    // Lógica del tema (Aplicación)
    useEffect(() => {
        if (isDark !== null) {
            if (isDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            }
        }
    }, [isDark]);

    // Funciones de acción de ejemplo
    const handleCreateProduct = () => console.log("Crear Producto...");
    const handleCreateCategory = () => console.log("Crear Categoría...");


    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
            
            {/* EL ENCABEZADO (header) HA SIDO ELIMINADO COMPLETAMENTE */}

            {/* Contenido Principal (Ahora comienza directamente con la "Vista General") */}
            <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">

                {/* Sección de Estadísticas/Resumen */}
                {/* Nota: Se incluye un título de página grande en lugar del header */}
                <h1 className="text-4xl font-extrabold text-text-light dark:text-text-dark mb-8">Dashboard Administrativo</h1>
                
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-6">Vista General 📊</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {summaryStats.map((item) => (
                        <StatCard key={item.title} {...item} />
                    ))}
                </div>

                <hr className="border-t border-gray-200 dark:border-gray-700 my-8" />

                {/* Sección de Administración de Productos y Categorías */}
                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-6">Gestión de Inventario 📦</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Card de Productos */}
                    <Card
                        title="Productos"
                        buttonText="Crear Producto"
                        onButtonClick={handleCreateProduct}
                    >
                        <ProductItem name="Pan Artesanal" category="Panadería" imgSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuDnJYVWJFrauI08Qao5fMvlJlA11ECBJVXQ8ypYFTpids4ABJPYslSYqdS9SubTL6zT8dE-xV7Qw8d2m7DzRbb8qJcZiviPOZwhyXp1v7IifSLZ0RzpXtOWglTFSSC-pKS7pStshm6g32je-aHpsqkso6vn0nM8cA0Ky6N5sJfJK4lXHSJi23CXW-VUa2zOyGqdreB7Sp9a6EoCNlwPKpwMtGncKnNtSI2q-w3bJ6pzCPDb164DOUtqAc8whieP3EJFusXvPDtyo5Q" imgAlt="Pan artesanal" />
                        <ProductItem name="Leche Fresca" category="Lácteos" imgSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBV1mZRucU7nYCZkgkX5S4WI6L16qatboMTtkAqftrcdjdOBVXG07Hug9hV3ziOzrzAI7zKKQa_wBMlsM-6twIb7Jng4Pyx5mzpLg_H5Wjs-sYTisE3SsS86BaW0SrgzQHrEUn70ZLTsVtX-5TTc_qff8OwBgggvxCUCohtECIj0qocaaFlXLrqc0NPl55YHkyZPUcEHaJ7dlj7zO-9OSY8p14OyaWXOHvkLFC-IFn56iThR86LFwKg9s6a6u0My8EIZyYtJyzvuio" imgAlt="Leche Fresca" />
                        <ProductItem name="Manzanas Rojas" category="Frutas y Verduras" imgSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuDUxA3M6B7IFCBnozbM-R_mqBl5ZEQEUyad7HN-CHJMGSu4C24O7578CXzJCRlDIG4pfA_vO3fbhvS8Z-5de1jzShKtgF8HQIhbeNkVEWmCEgYYJrAEfQB0CEzLqeyhREaM_jwuQ0I1xNEDfSF3lwq-f5n6W2sJF_7s2w5DXpI5zg9hdc6NeCmxb3V0oMUllhA7jfZbvFVMm683BU1zypuFiZ1yUWtcLidOwHIVdE9Qg2ENsZ2yh_zLHMeS_wn6hewfAo1aXxCkREI" imgAlt="Manzanas rojas" />
                    </Card>

                    {/* Card de Categorías */}
                    <Card
                        title="Categorías"
                        buttonText="Crear Categoría"
                        onButtonClick={handleCreateCategory}
                    >
                        <CategoryItem name="Panadería" />
                        <CategoryItem name="Lácteos" />
                        <CategoryItem name="Frutas y Verduras" />
                        <CategoryItem name="Bebidas" />
                        <CategoryItem name="Limpieza" />
                    </Card>
                </div>
                
                {/* Columna Derecha: Ventas por Categoría (Nuevo) */}
                <div className="mt-8">
                    <Card title="Ventas Recientes por Categoría" buttonText={null}>
                        <div className="space-y-4">
                            {categorySales.map((cat) => (
                                <div key={cat.name} className="flex justify-between items-center p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center">
                                        <div className={`mr-3 text-lg ${cat.color}`}>
                                            {cat.icon}
                                        </div>
                                        <p className="text-text-light dark:text-text-dark font-semibold">{cat.name}</p>
                                    </div>
                                    <p className="font-bold text-lg text-primary">{cat.value}</p>
                                </div>
                            ))}
                            <div className="text-right pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-subtle-light dark:text-subtle-dark">Total Ventas (Período)</p>
                                <p className="text-2xl font-extrabold text-green-600 dark:text-green-400">$ 8.500</p>
                            </div>
                        </div>
                    </Card>
                </div>

            </main>
        </div>
    );
};

export default AdminPanelPage;