import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 AÑADIR: Para la navegación
import { useDispatch, useSelector } from 'react-redux'; // 👈 AÑADIR: Hooks de Redux
import { FaChartBar, FaTag, FaStar, FaDollarSign } from 'react-icons/fa';

// 👈 AÑADIR: Importa los thunks que creamos
import { fetchProductos, deleteProducto } from '../redux/productosSlice';
import { fetchCategorias, deleteCategoria } from '../redux/categoriasSlice';

// --- Tus componentes reutilizables (Card, StatCard) se mantienen igual ---
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

// --- ⚠️ MODIFICAMOS ProductItem y CategoryItem para que los botones funcionen ---

const ProductItem = ({ name, category, imgSrc, imgAlt, onEdit, onDelete }) => ( // 👈 AÑADIR props
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
                onClick={onEdit} // 👈 AÑADIR onClick
                aria-label={`Editar producto ${name}`}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-subtle-light dark:text-subtle-dark transition-colors"
            >
                <span className="material-icons text-base">edit</span>
            </button>
            <button
                onClick={onDelete} // 👈 AÑADIR onClick
                aria-label={`Eliminar producto ${name}`}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
            >
                <span className="material-icons text-base">delete</span>
            </button>
        </div>
    </div>
);

const CategoryItem = ({ name, onEdit, onDelete }) => ( // 👈 AÑADIR props
    <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
        <p className="font-semibold text-text-light dark:text-text-dark">{name}</p>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button
                onClick={onEdit} // 👈 AÑADIR onClick
                aria-label={`Editar categoría ${name}`}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-subtle-light dark:text-subtle-dark transition-colors"
            >
                <span className="material-icons text-base">edit</span>
            </button>
            <button
                onClick={onDelete} // 👈 AÑADIR onClick
                aria-label={`Eliminar categoría ${name}`}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
            >
                <span className="material-icons text-base">delete</span>
            </button>
        </div>
    </div>
);


// --- Componente Principal ---

// Renombrado a DashboardPage
const DashboardPage = () => {
    // ... (El código de manejo del tema oscuro/claro se mantiene igual) ...
    const [isDark, setIsDark] = useState(null);
    useEffect(() => { /* ... */ }, []);
    useEffect(() => { /* ... */ }, [isDark]);


    // 👈 AÑADIR LÓGICA DE REDUX Y NAVEGACIÓN
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Seleccionamos los datos del estado de Redux
    const { items: productos, status: productosStatus, error: productosError } = useSelector((state) => state.productos);
    const { items: categorias, status: categoriasStatus, error: categoriasError } = useSelector((state) => state.categorias);

    // Carga inicial de datos desde la API
    useEffect(() => {
        if (productosStatus === 'idle') {
            dispatch(fetchProductos());
        }
        if (categoriasStatus === 'idle') {
            dispatch(fetchCategorias());
        }
    }, [productosStatus, categoriasStatus, dispatch]);

    // 👈 AÑADIR Funciones de acción que se conectan a Redux y la navegación
    const handleNavigateToCreateProduct = () => navigate("/admin/productos/nuevo");
    const handleNavigateToCreateCategory = () => navigate("/admin/categorias/nueva");

    const handleDeleteProduct = (id, name) => {
        if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${name}"?`)) {
            dispatch(deleteProducto(id));
        }
    };

    const handleDeleteCategory = (id, name) => {
        // Podríamos añadir una validación extra aquí (ej: no borrar si tiene productos)
        if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${name}"?`)) {
            dispatch(deleteCategoria(id));
        }
    };


    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
            <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">

                <h2 className="text-3xl font-bold text-text-light dark:text-text-dark mb-6">Gestión de Inventario 📦</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    
                    {/* 👈 Card de Productos CONECTADA A REDUX */}
                    <Card
                        title="Productos"
                        buttonText="Crear Producto"
                        onButtonClick={handleNavigateToCreateProduct}
                    >
                        {productosStatus === 'loading' && <p className="text-center text-gray-500">Cargando productos...</p>}
                        {productosError && <p className="text-center text-red-500">{productosError}</p>}
                        {productosStatus === 'succeeded' && productos.length > 0 ? (
                            productos.map(producto => (
                                <ProductItem
                                    key={producto.id}
                                    name={producto.nombre}
                                    category={producto.categoria?.nombre || 'Sin categoría'}
                                    imgSrc={producto.urlImagen || 'https://placehold.co/100x100'}
                                    imgAlt={producto.nombre}
                                    onEdit={() => navigate(`/admin/productos/editar/${producto.id}`)}
                                    onDelete={() => handleDeleteProduct(producto.id, producto.nombre)}
                                />
                            ))
                        ) : (
                           productosStatus === 'succeeded' && <p className="text-center text-gray-400">No hay productos para mostrar.</p>
                        )}
                    </Card>

                    {/* 👈 Card de Categorías CONECTADA A REDUX */}
                    <Card
                        title="Categorías"
                        buttonText="Crear Categoría"
                        onButtonClick={handleNavigateToCreateCategory}
                    >
                        {categoriasStatus === 'loading' && <p className="text-center text-gray-500">Cargando categorías...</p>}
                        {categoriasError && <p className="text-center text-red-500">{categoriasError}</p>}
                        {categoriasStatus === 'succeeded' && categorias.length > 0 ? (
                            categorias.map(categoria => (
                                <CategoryItem
                                    key={categoria.id}
                                    name={categoria.nombre}
                                    onEdit={() => navigate(`/admin/categorias/editar/${categoria.id}`)}
                                    onDelete={() => handleDeleteCategory(categoria.id, categoria.nombre)}
                                />
                            ))
                        ) : (
                           categoriasStatus === 'succeeded' && <p className="text-center text-gray-400">No hay categorías para mostrar.</p>
                        )}
                    </Card>
                </div>
                
                {/* ... (el resto del JSX con las estadísticas se mantiene igual por ahora) ... */}
            </main>
        </div>
    );
};

export default DashboardPage; // 👈 Exportamos el componente con el nombre correcto