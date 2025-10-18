import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategorias } from "../redux/categoriesSlice";
import { createProducto, updateProducto, fetchProductoById } from "../redux/productosSlice"; 
// ✅ Importamos deleteImage
import { uploadImage, deleteImage } from "../redux/imagenesSlice"; 
import { toast } from 'react-toastify'; 

const PRODUCTO_VACIO = {
  nombre: "",
  descripcion: "",
  imagenes: [], // ✅ Sigue siendo un array de objetos { id, ... }
  precio: 0,
  marca: "",
  categoria_id: 0,
  stock: 0,
  descuento: 0,
  stock_minimo: 0, 
  unidad_medida: "",
  estado: "activo",
  ventas_totales: 0,
};

export default function ProductEditPage({ modo = "editar" }) {
  const { id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [producto, setProducto] = useState(
    modo === "crear" ? PRODUCTO_VACIO : null
  );
  const [categorias, setCategorias] = useState([]);
  const [categoriasCargadas, setCategoriasCargadas] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false); 

  // ---------------------------
  // Efecto para cargar categorías (Sin cambios)
  // ---------------------------
  useEffect(() => {
    async function fetchCategoriasAsync() {
      try {
        const res = await dispatch(fetchCategorias()).unwrap();
        const data = res; 
        if (Array.isArray(data?.content)) {
          setCategorias(data.content);
        } else if (Array.isArray(data)) {
          setCategorias(data);
        } else {
          setCategorias([]);
        }
        setCategoriasCargadas(true);
      } catch (e) {
        toast.error("Error al cargar las categorías.");
        setCategorias([]);
        setCategoriasCargadas(true);
      }
    }
    fetchCategoriasAsync();
  }, [dispatch]);

  // ---------------------------
  // Efecto para cargar producto en modo editar
  // ---------------------------
  useEffect(() => {
    if (modo !== "editar" || !categoriasCargadas) return;
    let cancelado = false;
    async function fetchProducto() {
      try {
        const res = await dispatch(fetchProductoById(id)).unwrap();
        const data = res.producto; 
        if (data) {
          // ✅ El DTO ya nos da el array de {id, imagen}
          const imagenesNormalizadas = Array.isArray(data.imagenes)
            ? data.imagenes
            : [];

          let categoria_id = "";
          if (data.categoria && categorias.length > 0) {
            const cat = categorias.find((c) => c.nombre === data.categoria);
            categoria_id = cat ? cat.id : "";
          }
          if (!cancelado) {
            setProducto({
              ...data,
              imagenes: imagenesNormalizadas, // ✅ Se asigna directo
              categoria_id,
              stock_minimo: data.stockMinimo ?? 0,
                unidad_medida: data.unidadMedida ?? "",
              ventas_totales: data.ventasTotales ?? 0,
              descuento: data.descuento ?? 0,
              precio: data.precio ?? 0,
              stock: data.stock ?? 0,
              marca: data.marca ?? "",
              descripcion: data.descripcion ?? "",
              estado: data.estado ?? "activo",
              nombre: data.nombre ?? "",
            });
          }
        } else {
          setError("No se pudo cargar el producto.");
        }
      } catch (e) {
        const errorMsg = e.payload || "Error de red al cargar producto.";
        toast.error("Error al cargar datos del producto.");
        setError(errorMsg);
      }
    }
    fetchProducto();
    return () => {
      cancelado = true;
    };
  }, [id, modo, categorias, categoriasCargadas, dispatch]);

  useEffect(() => {
    if (
      producto &&
      !producto.categoria_id &&
      producto.categoria &&
      categorias.length > 0
    ) {
      const cat = categorias.find((c) => c.nombre === producto.categoria);
      if (cat) {
        setProducto((prev) => ({
          ...prev,
          categoria_id: cat.id,
        }));
      }
    }
  }, [producto, categorias]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    const isNumber = ['precio', 'stock', 'descuento', 'stock_minimo', 'ventas_totales', 'categoria_id'].includes(name);
    setProducto((prev) => ({
      ...prev,
      [name]: isNumber ? Number(value) : value,
    }));
  };

  // ✅ Lógica de borrado (Sigue igual)
  const handleEliminarImagen = async (imageId) => {
    if (uploading) return; 

    try {
      await dispatch(deleteImage({ imageId, token })).unwrap();
      setProducto((prev) => ({
        ...prev,
        imagenes: prev.imagenes.filter((img) => img.id !== imageId),
      }));
      toast.success("Imagen eliminada del servidor.");
    } catch (e) {
      const errorMsg = e.payload || "Fallo al eliminar la imagen.";
      toast.error(errorMsg);
    }
  };

  // ✅ Lógica de subida (Ajustada)
  const handleUploadImage = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      setUploading(true);
      try {
          if (modo === 'crear' || !producto.id) {
              toast.error("Guarda el producto primero para subir imágenes.");
              return;
          }
          
          const res = await dispatch(uploadImage({ productId: producto.id, file, token })).unwrap();
          
          // ✅ Obtenemos ID y PATH
          const newId = res?.idImagen;
          const newPath = res?.path; // 'path' es lo que devuelve tu controller
          
          if (newPath && newId) {
              setProducto((prev) => ({
                  ...prev,
                // ✅ Guardamos {id, imagen}
                  imagenes: [...prev.imagenes, { id: newId, imagen: newPath }], 
              }));
              toast.success("Imagen subida y guardada.");
          } else {
              toast.error("Error: El servidor no devolvió ID o Path de la imagen.");
          }
      } catch (e) {
          const errorMsg = e.payload || "Fallo al subir la imagen.";
          toast.error(errorMsg);
      } finally {
          setUploading(false);
          event.target.value = null; 
      }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      // ✅ ESTE ES EL BODY CORREGIDO
      // Solo incluye los campos que tu DTO (ProductoRequest)
      // y tu ServiceImpl (ProductoServiceImpl) realmente utilizan.
      const body = {
    // SÍ: Estos son los campos que tu ProductoServiceImpl SÍ espera
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    precio: Number(producto.precio) || 0,
    marca: producto.marca || "Sin marca",
    categoria_id: Number(producto.categoria_id), 
    stock: Number(producto.stock) || 0,
    descuento: Number(producto.descuento) || 0,
    stockMinimo: Number(producto.stock_minimo) || 0, 
    estado: producto.estado,
    
    // NO: Asegúrate de que estas líneas ESTÉN BORRADAS
    // imagenes: [],
    // unidadMedida: "...",
    // ventasTotales: 0,
      };
      
      let res;
      if (modo === "crear") {
        // ... (tu lógica de crear)
      } else {
        // El 'PUT' que te está dando error
        res = await dispatch(updateProducto({ id: producto.id, data: body, token })).unwrap();
        toast.success("Producto actualizado correctamente.");
        setTimeout(() => navigate("/admin/productos"), 1000); 
      }
      
    } catch (e) {
      const errorMsg = e.payload || "Error al guardar el producto.";
      toast.error(errorMsg);
      setError(errorMsg);
    }
  };

  if (!producto)
    return (
      <div className="text-center mt-20">Cargando producto...</div>
    );

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {modo === "crear" ? "Crear producto" : "Editar producto"}
      </h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* ... (Todos tus inputs: ID, Nombre, Marca, etc. van aquí) ... */}
        {/* Pego los inputs de tu archivo original */}
        {producto.id && (
          <div><label className="font-semibold">ID</label><input className="input" value={producto.id} disabled readOnly /></div>
        )}
        <div><label className="font-semibold">Nombre</label><input className="input" name="nombre" value={producto.nombre} onChange={handleChange} required disabled={modo === "editar"} readOnly={modo === "editar"}/></div>
        <div><label className="font-semibold">Marca</label><input className="input" name="marca" value={producto.marca} onChange={handleChange} required disabled={modo === "editar"} readOnly={modo === "editar"}/></div>
        <div>
          <label className="font-semibold">Categoría</label>
          <select className="input" name="categoria_id" value={producto.categoria_id || ""} onChange={handleChange} required>
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (<option key={cat.id} value={cat.id}>{cat.nombre}</option>))}
          </select>
        </div>
        <div><label className="font-semibold">Descripción</label><textarea className="input" name="descripcion" value={producto.descripcion} onChange={handleChange} required/></div>
        <div><label className="font-semibold">Precio</label><input className="input" type="number" name="precio" value={producto.precio} onChange={handleChange} step="0.01" required/></div>
        <div><label className="font-semibold">Stock</label><input className="input" type="number" name="stock" value={producto.stock} onChange={handleChange} required/></div>
        <div><label className="font-semibold">Unidad de medida</label><input className="input" name="unidad_medida" value={producto.unidad_medida} onChange={handleChange}/></div>
        <div><label className="font-semibold">Descuento (%)</label><input className="input" type="number" name="descuento" value={producto.descuento} onChange={handleChange} step="0.01"/></div>
        <div><label className="font-semibold">Ventas totales</label><input className="input" type="number" name="ventas_totales" value={producto.ventas_totales} onChange={handleChange}/></div>
        <div><label className="font-semibold">Stock mínimo</label><input className="input" type="number" name="stock_minimo" value={producto.stock_minimo} onChange={handleChange}/></div>
        <div>
          <label className="font-semibold">Estado</label>
          <select className="input" name="estado" value={producto.estado} onChange={handleChange}>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        {/* ✅ Sección de imágenes (Ajustada) */}
        <div>
          <label className="font-semibold">Imágenes</label>
          <div className="space-y-2">
            {producto.imagenes && producto.imagenes.length > 0 ? (
              producto.imagenes.map((img) => (
                <div key={img.id} className="flex flex-col items-center mb-4 border p-2 rounded">
                  <img
                      src={img.imagen} // ✅ CAMBIO: Leemos 'imagen'
                    alt={`Imagen ${img.id}`}
                    className="w-40 h-40 object-cover rounded border mb-2"
                  />
                  <button
                    type="button"
                    className="bg-red-500 text-white px-2 py-1 rounded"
                    onClick={() => handleEliminarImagen(img.id)}
                    disabled={uploading}
                  >
                    Eliminar
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No hay imágenes</div>
            )}
          </div>
          <div className="flex gap-2 mt-4 items-center">
            <input
              type="file"
              accept="image/*"
              className="input flex-1 p-1 border rounded"
              onChange={handleUploadImage} // ✅ CORREGIDO
              disabled={uploading || !producto.id} // ✅ CORREGIDO
            />
            {uploading && <span className="text-sm text-gray-500">Subiendo...</span>}
          </div>
          {modo === 'crear' && <p className="text-xs text-red-500">Guarda el producto primero para habilitar la subida de imágenes.</p>}
        </div>


        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded font-semibold"
            disabled={uploading} 
          >
            {modo === "crear" ? "Crear y continuar" : "Guardar cambios"}
          </button>
          <button
            type="button"
            className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-red-600 transition-colors"
            onClick={() => navigate("/admin/productos")}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}