// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { FaTag } from 'react-icons/fa';

// --- Componentes Reutilizables (Card, ProductItem, CategoryItem, ProductFormModal) ---

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
        <div className="space-y-4 flex-grow overflow-y-auto max-h-96 pr-2">
            {children}
        </div>
    </div>
);

/**
 * Componente para mostrar un Producto dentro de la lista de administración.
 */
const ProductItem = ({ product, onEdit, onDelete }) => (
    <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
        <div className="flex items-center space-x-4">
            {/* Si la URL de la imagen existe, la usamos; si no, usamos un placeholder. */}
            <img 
                alt={product.nombre} 
                className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
                src={product.imagenes && product.imagenes.length > 0 ? product.imagenes[0] : `https://via.placeholder.com/64x64?text=${product.nombre[0]}`} 
            />
            <div>
                <p className="font-semibold text-text-light dark:text-text-dark">{product.nombre}</p>
                <p className="text-sm text-subtle-light dark:text-subtle-dark">Stock: {product.stock} | Cat: {product.categoria || 'N/A'}</p>
            </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button
                aria-label={`Editar producto ${product.nombre}`}
                onClick={() => onEdit(product)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-subtle-light dark:text-subtle-dark transition-colors"
            >
                <span className="material-icons text-base">edit</span>
            </button>
            <button
                aria-label={`Eliminar producto ${product.nombre}`}
                onClick={() => onDelete(product.id)}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
            >
                <span className="material-icons text-base">delete</span>
            </button>
        </div>
    </div>
);

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
const ProductFormModal = ({ product, onClose, onSave }) => {
    // Asegura que los campos requeridos tengan valores por defecto
    const [formData, setFormData] = useState(product || {
        nombre: '',
        descripcion: '',
        precio: 0,
        marca: '',
        stock: 0,
        descuento: 0,
        // 🚨 VALORES POR DEFECTO PARA LOS CAMPOS FALTANTES
        categoria_id: product?.categoria_id || 1, // ID Categoria (Debes saber cuál es una ID válida)
        stock_minimo: product?.stock_minimo || 0, // Stock mínimo
        imagenes: product?.imagenes || [],
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-2xl w-full max-w-lg m-4">
                <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-text-dark">
                    {product ? 'Editar Producto' : 'Crear Producto'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Nombre</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Precio ($)</label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                            />
                        </div>
                    </div>
                    
                    {/* El campo marca no es obligatorio en tu ejemplo, pero es bueno tenerlo */}
                    <div>
                        <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Marca</label>
                        <input
                            type="text"
                            name="marca"
                            value={formData.marca || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                        />
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 transition"
                        >
                            Guardar Producto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principal ---

const DashboardPage = () => {
    // --- Lógica del Tema (Modo Oscuro/Claro) ---
    const [isDark, setIsDark] = useState(null);
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDark = savedTheme ? savedTheme === 'dark' : prefersDark;
        setIsDark(initialDark);
    }, []);
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
    // ---------------------------------------------

    // --- Estado para la Gestión de Productos ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const API_BASE_URL = "http://localhost:8080/producto";

    // --- Carga de Productos (CORREGIDA) ---
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: El servidor no respondió correctamente.`);
            }
            
            const data = await response.json();
            
            // CORRECCIÓN: Accedemos a la propiedad 'productos'
            const productsArray = data.productos; 

            if (!Array.isArray(productsArray)) {
                 throw new Error("Formato de datos inválido: La propiedad 'productos' no es una lista.");
            }
            
            setProducts(productsArray);

        } catch (err) {
            console.error("Error fetching products:", err);
            setError(`Error de Conexión: ${err.message}`); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    // --- Handlers de Acción de Productos (Se mantienen con la URL base) ---
    const handleCreateProduct = () => {
        setProductToEdit(null); 
        setIsModalOpen(true);
    };

    const handleEditProduct = (product) => {
        setProductToEdit(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar el producto con ID ${id}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
            if (response.ok || response.status === 204) {
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                throw new Error('Error al eliminar el producto.');
            }
        } catch (err) {
            console.error("Error deleting product:", err);
            alert("No se pudo eliminar el producto. Verifica la ruta DELETE.");
        }
    };

    // --- Handlers de Acción de Productos (SOLUCIÓN para error 400 'id debe ser > 0') ---

    // --- Handlers de Acción de Productos (SOLUCIÓN FINAL para errores 400: id y validación de precio) ---

    // --- Handlers de Acción de Productos (SOLUCIÓN FINAL para el error 400 en PUT) ---

    // --- Handlers de Acción de Productos (AJUSTE FINAL para el error 400 en PUT) ---
    // --- Handlers de Acción de Productos (Añadiendo campos obligatorios del Backend) ---
    const handleSaveProduct = async (productData) => {
        
        // Determinar si es una creación o edición
        const isNew = !productData.id || productData.id <= 0;
        const method = isNew ? 'POST' : 'PUT';
        
        // Obtenemos el ID para la URL (si existe)
        const productIdForUrl = productData.id; 
        const url = isNew ? API_BASE_URL : `${API_BASE_URL}/${productIdForUrl}`;
        
        try {
            // 1. Clonar y construir el objeto a enviar
            const dataToSend = { ...productData }; 

            // 2. 🚨 INCLUSIÓN DE CAMPOS OBLIGATORIOS FALTANTES
            // La entidad en Java requiere una CATEGORIA (objeto) o un categoria_id (si usas un DTO de entrada)
            // Usaremos el categoria_id que sabemos que existe en el producto original para la edición.
            dataToSend.categoria_id = productData.categoria_id || 1; // Usar el ID original, o 1 por defecto si es nuevo
            dataToSend.stock_minimo = productData.stock_minimo || 0; // Usar el original, o 0 por defecto
            
            // El backend espera el objeto CATEGORIA en el DTO, no el nombre (lo elimina)
            delete dataToSend.categoria; 

            // 3. LIMPIEZA FORZOSA: Eliminar el 'id' del cuerpo (SOLUCIÓN al error 400)
            if (dataToSend.id) {
                delete dataToSend.id; 
            }
            
            // 4. Ejecutar Fetch
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend), 
            });

            if (!response.ok) {
                const errorBody = await response.text();
                
                // Intenta extraer un mensaje de error legible
                let errorMessage = `Error ${response.status} en la operación ${method}. Detalles: ${errorBody.substring(0, 100)}...`;
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorMessage = errorJson.mensaje || errorJson.error || errorMessage;
                } catch (e) {
                    // ...
                }

                throw new Error(errorMessage);
            }

            // Éxito
            await fetchProducts(); 
            setIsModalOpen(false); 

        } catch (err) {
            console.error("Error saving product:", err);
            alert(`Error al guardar el producto: ${err.message}`);
        }
    };




    const handleCreateCategory = () => console.log("Crear Categoría...");

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
            
            {/* Modal de Producto */}
            {isModalOpen && (
                <ProductFormModal 
                    product={productToEdit}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProduct}
                />
            )}

            {/* Contenido Principal (Dashboard) */}
            <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">

                <h1 className="text-4xl font-extrabold text-text-light dark:text-text-dark mb-8">Dashboard Administrativo 🚀</h1>
                
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
                        {loading && <p className="text-center text-blue-500">Cargando productos...</p>}
                        {error && <p className="text-center text-red-500">{error}</p>}
                        
                        {!loading && !error && (!Array.isArray(products) || products.length === 0) && (
                            <p className="text-center text-subtle-light dark:text-subtle-dark">
                                No hay productos disponibles.
                            </p>
                        )}
                        
                        {Array.isArray(products) && products.map((product) => (
                            <ProductItem 
                                key={product.id} 
                                product={product} 
                                onEdit={handleEditProduct} 
                                onDelete={handleDeleteProduct}
                            />
                        ))}
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

            </main>
        </div>
    );
};

export default DashboardPage;