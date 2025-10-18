// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaTag } from 'react-icons/fa';
import { fetchCategorias, addCategoria, editCategoria, deleteCategoria } from '../redux/categoriesSlice';

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
        <div className="space-y-4 flex-grow overflow-y-auto max-h-96 pr-2">
            {children}
        </div>
    </div>
);

/**
 * Componente para mostrar un Producto dentro de la lista de administración.
 */
const ProductItem = ({ product, onEdit, onDelete }) => {
    // Obtener la primera imagen o usar placeholder
    const imagenUrl = product.imagenes && product.imagenes.length > 0 
        ? `http://localhost:8080/${product.imagenes[0].imagen || product.imagenes[0]}`
        : `https://placehold.co/64x64?text=${product.nombre[0]}`;

    return (
        <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
            <div className="flex items-center space-x-4">
                <img 
                    alt={product.nombre} 
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
                    src={imagenUrl}
                    onError={(e) => {
                        // ✅ CORREGIDO: URL alternativa
                        e.target.src = `https://placehold.co/64x64?text=${product.nombre[0] || '?'}`;
                    }}
                />
                <div>
                    <p className="font-semibold text-text-light dark:text-text-dark">{product.nombre}</p>
                    <p className="text-sm text-subtle-light dark:text-subtle-dark">
                        Stock: {product.stock} | Cat: {product.categoria || 'N/A'}
                    </p>
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
};

/**
 * Componente para mostrar una Categoría.
 */
const CategoryItem = ({ category, onEdit, onDelete }) => (
    <div className="flex items-center justify-between p-3 bg-background-light dark:bg-background-dark rounded-lg border border-gray-100 dark:border-gray-700 transition-shadow hover:shadow-md">
        <p className="font-semibold text-text-light dark:text-text-dark">{category.nombre}</p>
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button
                aria-label={`Editar categoría ${category.nombre}`}
                onClick={() => onEdit(category)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-subtle-light dark:text-subtle-dark transition-colors"
            >
                <span className="material-icons text-base">edit</span>
            </button>
            <button
                aria-label={`Eliminar categoría ${category.nombre}`}
                onClick={() => onDelete(category)}
                className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 text-red-500 transition-colors"
            >
                <span className="material-icons text-base">delete</span>
            </button>
        </div>
    </div>
);

/**
 * Modal para Crear/Editar Producto con soporte para imágenes
 */
const ProductFormModal = ({ product, onClose, onSave, categorias, token }) => {
const [formData, setFormData] = useState(product || {
        nombre: '',
        descripcion: '',
        precio: 0,
        marca: '',
        stock: 0,
        descuento: 0,
        estado: 'activo',
        categoria_id: product?.categoria_id || (categorias.length > 0 ? categorias[0].id : 1),
        stock_minimo: product?.stock_minimo || 0,
        imagenes: product?.imagenes || [],
    });

    // Estado para manejar imágenes
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [imageError, setImageError] = useState('');

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value,
        }));
    };

    // Handler para seleccionar archivos
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Validar cantidad (máximo 10 imágenes)
        if (files.length + formData.imagenes.length > 10) {
            setImageError('No puedes agregar más de 10 imágenes en total.');
            return;
        }

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = files.filter(f => !validTypes.includes(f.type));
        
        if (invalidFiles.length > 0) {
            setImageError('Solo se permiten imágenes (JPG, PNG, GIF, WEBP).');
            return;
        }

        // Validar tamaño (máx 5MB por imagen)
        const oversizedFiles = files.filter(f => f.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            setImageError('Las imágenes no pueden superar 5MB cada una.');
            return;
        }

        setImageError('');
        setSelectedFiles(files);
    };

    // Subir imágenes después de crear el producto
    const uploadImages = async (productId) => {
        if (selectedFiles.length === 0) return;

        try {
            for (const file of selectedFiles) {
                const formDataImg = new FormData();
                formDataImg.append('archivo', file);

                const response = await fetch(`http://localhost:8080/producto/${productId}/imagen`, {
                    method: 'POST',
                    headers: { // ✅ AÑADE ESTOS HEADERS
                        'Authorization': `Bearer ${token}`
                    },
                    body: formDataImg,
                });

                if (!response.ok) {
                    throw new Error(`Error al subir imagen: ${file.name}`);
                }
            }
        } catch (err) {
            console.error('Error uploading images:', err);
            alert(`Error al subir imágenes: ${err.message}`);
        } finally {
            setUploadingImages(false);
        }
    };

    // Eliminar imagen existente
    const handleRemoveExistingImage = async (imagenId) => {
        if (!window.confirm('¿Eliminar esta imagen?')) return;

        try {
            const response = await fetch(`http://localhost:8080/producto/imagen/${imagenId}`, {
                method: 'DELETE',
                headers: { // ✅ AÑADE ESTOS HEADERS
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setFormData(prev => ({
                    ...prev,
                    imagenes: prev.imagenes.filter(img => img.id !== imagenId)
                }));
            }
        } catch (err) {
            alert('Error al eliminar la imagen');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // 1. Guardar el producto
            const savedProduct = await onSave(formData);
            
            // 2. Si hay imágenes seleccionadas, subirlas
            if (selectedFiles.length > 0) {
                const productId = savedProduct?.id || product?.id;
                if (productId) {
                    await uploadImages(productId);
                }
            }

        } catch (err) {
            console.error('Error in submit:', err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-text-dark">
                    {product ? 'Editar Producto' : 'Crear Producto'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    <div>
                        <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Nombre *</label>
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
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Categoría *</label>
                        <select
                            name="categoria_id"
                            value={formData.categoria_id}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm p-2 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
                        >
                            {categorias.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Precio ($) *</label>
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
                            <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Stock *</label>
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

                    {/* Sección de imágenes */}
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark mb-2">
                            Imágenes del producto (máx. 10)
                        </label>

                        {/* Mostrar imágenes existentes */}
                        {product && formData.imagenes && formData.imagenes.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Imágenes actuales:</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {formData.imagenes.map((img) => (
                                        <div key={img.id} className="relative group">
                                            <img 
                                                src={`http://localhost:8080/${img.imagen || img.path}`}
                                                alt="Producto" 
                                                className="w-full h-24 object-cover rounded border"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(img.id)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <span className="material-icons text-sm">close</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input para subir nuevas imágenes */}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-opacity-90"
                        />
                        
                        {imageError && (
                            <p className="text-red-500 text-sm mt-2">{imageError}</p>
                        )}

                        {selectedFiles.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs text-green-600">
                                    {selectedFiles.length} imagen(es) seleccionada(s)
                                </p>
                                <ul className="text-xs text-gray-500 ml-4 list-disc">
                                    {Array.from(selectedFiles).map((file, idx) => (
                                        <li key={idx}>{file.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploadingImages}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={uploadingImages}
                            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 transition disabled:opacity-50 flex items-center"
                        >
                            {uploadingImages ? (
                                <>
                                    <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                                    Subiendo...
                                </>
                            ) : (
                                'Guardar Producto'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/**
 * Modal para Crear/Editar Categoría
 */
const CategoryFormModal = ({ category, onClose, onSave }) => {
    const [nombre, setNombre] = useState(category?.nombre || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ nombre });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl shadow-2xl w-full max-w-md m-4">
                <h2 className="text-2xl font-bold mb-4 text-text-light dark:text-text-dark">
                    {category ? 'Editar Categoría' : 'Crear Categoría'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-subtle-light dark:text-subtle-dark">Nombre *</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
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
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Componente Principal ---

const DashboardPage = () => {
    const dispatch = useDispatch();
    
    // Obtener datos de Redux
    const { categorias, loading: loadingCategorias } = useSelector((state) => state.categorias);
    const { token } = useSelector((state) => state.auth);

    // Lógica del Tema (Modo Oscuro/Claro)
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

    // Estado para la Gestión de Productos
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productToEdit, setProductToEdit] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Estado para modal de categorías
    const [categoryToEdit, setCategoryToEdit] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const API_BASE_URL = "http://localhost:8080/producto";

    // Cargar categorías al iniciar
    useEffect(() => {
        dispatch(fetchCategorias());
    }, [dispatch]);

    // Carga de Productos
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_BASE_URL);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: El servidor no respondió correctamente.`);
            }
            
            const data = await response.json();
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

    // Handlers de Productos
   const handleCreateProduct = () => {
        // ✅ FIX: Crea una plantilla para el nuevo producto
        const newProductTemplate = {
            nombre: '',
            descripcion: '',
            precio: 0,
            marca: '',
            stock: 0,
            descuento: 0,
            estado: 'activo',
            // Asigna el ID de la primera categoría de la lista, si existe
            categoria_id: categorias.length > 0 ? categorias[0].id : undefined, 
            stock_minimo: 0,
            imagenes: [],
        };
        setProductToEdit(newProductTemplate); // Pasa la plantilla al estado
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
            alert("No se pudo eliminar el producto.");
        }
    };

    const handleSaveProduct = async (productData) => {
        // ✅ Determina el método y la URL
        const isNew = !productData.id || productData.id <= 0;
        const method = isNew ? 'POST' : 'PUT';
        // Usa productData.id para la URL si estás editando
        const url = isNew ? API_BASE_URL : `${API_BASE_URL}/${productData.id}`;
        
        try {
            // ✅ FIX: Valida que la categoría_id exista ANTES de enviar
if (!productData.categoria_id) {
                    throw new Error("La categoría es obligatoria. Por favor, selecciona una.");
            }
            
            // ✅ Prepara el body EXACTAMENTE como lo espera ProductoRequest.java
            const dataToSend = {
                nombre: productData.nombre,
                descripcion: productData.descripcion,
                precio: Number(productData.precio) || 0,
                marca: productData.marca || "Sin marca",
                stock: Number(productData.stock) || 0,
                descuento: Number(productData.descuento) || 0,
                estado: productData.estado || 'activo',
                
                // ✅ FIX: Quita el '|| 1' que causaba el Error 400
                categoria_id: Number(productData.categoria_id), 
                
                stockMinimo: Number(productData.stock_minimo) || 0
            };
            
            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // ✅ Envía el Token
                },
                body: JSON.stringify(dataToSend), 
            });

            if (!response.ok) {
                const errorBody = await response.text();
                let errorMessage = `Error ${response.status} en la operación ${method}.`;
                try {
                    const errorJson = JSON.parse(errorBody);
                    errorMessage = errorJson.mensaje || errorJson.error || errorMessage;
                } catch (e) {}
                throw new Error(errorMessage);
            }

            const result = await response.json();
            
            // Devuelve el producto guardado (para el modal)
            const savedProduct = result.producto || result.productoActualizado || result;

            // Refresca la lista de productos
            await fetchProducts(); 
            
            // Devuelve el producto para que el modal suba las imágenes
            return savedProduct; 

        } catch (err) {
            console.error("Error saving product:", err);
            alert(`Error al guardar el producto: ${err.message}`);
            throw err; // Lanza el error para que el modal lo sepa
        }
    };

    // Handlers de Categorías
    const handleCreateCategory = () => {
        setCategoryToEdit(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategory = (category) => {
        setCategoryToEdit(category);
        setIsCategoryModalOpen(true);
    };

    const handleDeleteCategory = async (category) => {
        if (!window.confirm(`¿Estás seguro de eliminar "${category.nombre}"?`)) return;
        
        await dispatch(deleteCategoria({ id: category.id, token }));
    };

    const handleSaveCategory = async (categoryData) => {
        try {
            if (categoryToEdit) {
                // Editar
                await dispatch(editCategoria({ 
                    id: categoryToEdit.id, 
                    nombre: categoryData.nombre, 
                    parentId: null, 
                    token 
                }));
            } else {
                // Crear
                await dispatch(addCategoria({ 
                    nombre: categoryData.nombre, 
                    parentId: null, 
                    token 
                }));
            }
            setIsCategoryModalOpen(false);
        } catch (err) {
            alert("Error al guardar la categoría");
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark font-sans transition-colors duration-300">
            
            {/* Modal de Producto */}
            {isModalOpen && (
                <ProductFormModal 
                    product={productToEdit}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveProduct}
                    categorias={categorias}
                    token={token}
                />
            )}

            {/* Modal de Categoría */}
            {isCategoryModalOpen && (
                <CategoryFormModal
                    category={categoryToEdit}
                    onClose={() => setIsCategoryModalOpen(false)}
                    onSave={handleSaveCategory}
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
                        {loadingCategorias && <p className="text-center text-blue-500">Cargando categorías...</p>}
                        
                        {!loadingCategorias && categorias.length === 0 && (
                            <p className="text-center text-subtle-light dark:text-subtle-dark">
                                No hay categorías disponibles.
                            </p>
                        )}
                        
                        {categorias.map((cat) => (
                            <CategoryItem 
                                key={cat.id} 
                                category={cat}
                                onEdit={handleEditCategory}
                                onDelete={handleDeleteCategory}
                            />
                        ))}
</Card>
                </div>

            </main>
        </div>
    );
};

export default DashboardPage;
