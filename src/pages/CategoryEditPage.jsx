import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ProductAdminListCard from "../components/ProductAdminListCard";
import {
  fetchCategorias,
  addCategoria,
  editCategoria,
} from "../redux/categoriesSlice";

const CATEGORIA_VACIA = {
  nombre: "",
  parentCategoria: null,
  subcategorias: [],
  productos: [],
};

export default function CategoryEditPage({ modo = "editar" }) {
  const { id } = useParams();
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // OBTENEMOS LAS CATEGORÍAS COMPLETAS DEL SLIDE DE REDUX
  const categoriasRedux = useSelector((state) => state.categorias.categorias);

  // Estado principal
  const [categoria, setCategoria] = useState(
    modo === "crear" ? CATEGORIA_VACIA : null
  );
  const [nombre, setNombre] = useState("");
  const [parentId, setParentId] = useState("");
  const [subcategorias, setSubcategorias] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCategoryFromRedux = useCallback(() => {
    if (modo === "crear") {
      setCategoria(CATEGORIA_VACIA);
      setNombre("");
      setParentId("");
      setSubcategorias([]);
      return;
    }
    
    // Buscar la categoría en el array de Redux
    const categoriaFound = categoriasRedux.find((c) => c.id === id);

    if (categoriaFound) {
      // Usar los datos de Redux para poblar el estado
      setCategoria(categoriaFound);
      setNombre(categoriaFound.nombre);
      setParentId(categoriaFound.parentCategoria?.id || "");
      
      // Asegúrate de usar los productos y subcategorías que vienen con la categoría
      setSubcategorias(categoriaFound.subcategorias || []);

    } else if (categoriasRedux.length > 0) {
      // Si el array de redux tiene datos, pero no encontramos el ID.
      // Esto significa que el ID es inválido o la categoría no está en la lista.
      setError("La categoría no existe o no se pudo cargar desde el slide.");
    }
  }, [id, modo, categoriasRedux]); // Depende de Redux categorias

  // Carga inicial y recarga al cambiar categorías de Redux
  useEffect(() => {
    // 1. Asegurarse de que las categorías estén cargadas en Redux
    if (categoriasRedux.length === 0) {
      dispatch(fetchCategorias());
    } 

    // 2. Si las categorías ya están en Redux, cargar la categoría específica
    if (categoriasRedux.length > 0 || modo === "crear") {
      loadCategoryFromRedux();
    }
    

  }, [dispatch, id, modo, categoriasRedux.length, loadCategoryFromRedux]);


  // Handlers básicos
  const handleParentChange = (e) => setParentId(e.target.value);
  const handleNombreChange = (e) => setNombre(e.target.value);

 
  
  // Agregar subcategoría
  const handleAddSubcategoria = async () => {
    if (!selectedSubId) return;
    const catToAdd = categoriasRedux.find((c) => c.id === selectedSubId);
    if (!catToAdd) return;

    if (modo === "crear") {
      setSubcategorias([...subcategorias, catToAdd]);
      setSelectedSubId("");
    } else {
      const res = await dispatch(
        editCategoria({
          id: catToAdd.id,
          nombre: catToAdd.nombre,
          parentId: categoria.id,
          token,
        })
      );
    // El código original tenía una doble comprobación, lo simplifico a una:
    if (res.meta.requestStatus === "fulfilled") {
      setSelectedSubId("");
      // En lugar de un fetch específico, recargamos el slide completo de Redux
      // La dependencia en useEffect hará que loadCategoryFromRedux se ejecute y actualice el estado.
      dispatch(fetchCategorias()); 
    }
  }
  };

  // Quitar subcategoría
  const handleRemoveSubcategoria = async (sub) => {
    if (modo === "crear") {
      setSubcategorias(subcategorias.filter((s) => s.id !== sub.id));
    } else {
      const res = await dispatch(
        editCategoria({ id: sub.id, nombre: sub.nombre, parentId: null, token })
      );
      if (res.meta.requestStatus === "fulfilled") {
        // En lugar de un fetch específico, recargamos el slide completo de Redux
        dispatch(fetchCategorias());
      }
    }
  };

  // Guardar cambios o crear
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let res;
      if (modo === "crear") {
        res = await dispatch(
          addCategoria({ nombre, parentId: parentId || null, token })
        );
      } else {
        res = await dispatch(
          editCategoria({ id, nombre, parentId: parentId || null, token })
        );
      }
      if (res.meta.requestStatus === "fulfilled") {
        setSuccess(
          modo === "crear"
            ? "Categoría creada correctamente."
            : "Categoría actualizada correctamente."
        );
        // Recargamos las categorías para que el resto de la app vea el cambio
        dispatch(fetchCategorias()); 
        setTimeout(() => navigate("/admin/categorias"), 1200);
      }
      
      // Manejar errores de thunk (si `res` contiene `error`)
      if (res.meta.requestStatus === "rejected") {
        setError(res.payload || "Error al guardar la categoría.");
      }

    } catch (err) {
      setError("Error al guardar la categoría: " + err.message);
    }
  };

  // Cargando en edición
  if (modo === "editar" && !categoria) {
      // Muestra "Loading..." solo si el array de Redux está vacío,
      // O si el array no está vacío, pero aún no se ha encontrado la categoría (raro si loadCategoryFromRedux funciona bien).
      if (categoriasRedux.length === 0) return <div>Cargando categorías...</div>;
      // Si el error se ha establecido (porque el ID no existe en Redux), lo mostramos.
      if (error) return <div className="max-w-xl mx-auto p-6 text-red-600 font-bold">{error}</div>;
  }
  
  // Asegurarse de que `categoria` esté listo antes del renderizado
  if (!categoria) return <div>Cargando...</div>;


  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        {modo === "crear" ? "Crear Categoría" : "Editar Categoría"}
      </h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleSave} className="space-y-4">
        {modo === "editar" && (
          <div>
            <label className="font-semibold">ID</label>
            <input
              className="input" value={categoria.id} disabled readOnly
            />
          </div>
        )}
        <div>
          <label className="font-semibold">Nombre</label>
          <input
            className="input"
            value={nombre}
            onChange={handleNombreChange}
            required
          />
        </div>
        <div>
          <label className="font-semibold">Categoría padre</label>
          <select
            className="input"
            value={parentId}
            onChange={handleParentChange}
          >
            <option value="">Sin categoría padre</option>
            {categoriasRedux
              .filter(
                // Filtra para que no se pueda elegir a sí misma ni a sus descendientes
                (c) => c.id !== categoria?.id 
              )
              .map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
          </select>
        </div>
        
        {/* Lógica para agregar subcategorías */}
        {modo === "editar" && (
          <div className="mt-6 border-t pt-4 border-gray-100">
            <label className="font-semibold block mb-2">Añadir Subcategoría</label>
            <div className="flex gap-2 items-center">
              <select
                className="input flex-grow"
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {/* Mostrar categorías que no tienen padre y no son la categoría actual ni una subcategoría actual */}
                {categoriasRedux
                  .filter(
                    (c) => !c.parentCategoria?.id && c.id !== categoria.id && !categoria.subcategorias?.some(s => s.id === c.id)
                  )
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddSubcategoria}
                className="bg-green-500 text-white px-4 py-2 rounded font-semibold whitespace-nowrap"
              >
                Añadir
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <label className="font-semibold">Subcategorías Actuales</label>
          {(modo === "editar"
            ? categoria?.subcategorias || []
            : subcategorias
          ).length > 0 ? (
            <ul className="list-disc ml-6 space-y-1">
              {(modo === "editar"
                ? categoria?.subcategorias || []
                : subcategorias
              ).map((sub) => (
                <li
                  key={sub.id}
                  className="flex justify-between items-center bg-gray-50 p-2 rounded"
                >
                  <span>{sub.nombre}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubcategoria(sub)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 mb-4">No tiene subcategorías</div>
          )}
        </div>


        {/* Botones Guardar/Crear y Cancelar */}
        <div className="flex pt-4 border-t border-gray-100">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-primary/90 transition-colors"
          >
            {modo === "crear" ? "Crear Categoría" : "Guardar cambios"}
          </button>
          <button
            type="button"
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold ml-2 transition-colors"
            onClick={() => navigate("/admin/categorias")}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Sólo en edición: muestro productos de la categoría */}
      {modo === "editar" && categoria.productos && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 border-b pb-2">
            Productos de esta categoría ({categoria.productos.length})
          </h3>
          {categoria.productos.length > 0 ? (
            categoria.productos.map((prod) => (
              <ProductAdminListCard
                key={prod.id}
                producto={prod}
              />
            ))
          ) : (
            <div className="text-gray-500 bg-yellow-50 p-3 rounded">
              No hay productos directamente asignados a esta categoría.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
