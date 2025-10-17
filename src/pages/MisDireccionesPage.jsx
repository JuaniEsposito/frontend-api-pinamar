import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchDirecciones, saveDireccion, deleteDireccion, clearDireccionesMsg } from "../redux/direccionesSlice";
import { localidadesAMBA } from "../data/localidadesAMBA";
import { toast } from 'react-toastify'; //

export default function MisDireccionesPage() {
  const dispatch = useDispatch();
  const { direcciones, loading, error, success } = useSelector((state) => state.direcciones);
  
  // 👇 Obtener el usuario logueado desde Redux
  const { usuario } = useSelector((state) => state.auth);
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    calle: "",
    numero: "",
    pisoDepto: "",
    ciudad: "",
    provincia: "Buenos Aires",
    codigoPostal: "",
    tipoVivienda: "casa",
  });

  // Cargar direcciones al montar el componente
  useEffect(() => {
    dispatch(fetchDirecciones());
  }, [dispatch]);

  // Limpiar mensajes después de 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearDireccionesMsg());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "numero") {
      const filteredValue = value.replace(/\D/g, "");
      setFormData((prevData) => ({ ...prevData, [name]: filteredValue }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleAddDireccion = (e) => {
    e.preventDefault();
    if (!formData.calle || !formData.numero || !formData.ciudad || !formData.codigoPostal) {
    toast.error("Por favor, completá todos los campos.");      return;
    }

    // Validar que haya un usuario logueado
    if (!usuario || !usuario.id) {
      alert("Debes estar logueado para agregar una dirección.");
      return;
    }

    // Preparar el objeto para enviar al backend con el ID del usuario logueado
    const direccionToSave = {
      ...formData,
      usuario: { id: usuario.id } // 👈 Ahora usa el ID del usuario logueado desde Redux
    };

    dispatch(saveDireccion({ direccion: direccionToSave, editId }));
    
    // Resetear formulario
    setFormData({
      calle: "",
      numero: "",
      pisoDepto: "",
      ciudad: "",
      provincia: "Buenos Aires",
      codigoPostal: "",
      tipoVivienda: "casa",
    });
    setShowForm(false);
    setEditId(null);
  };

  const handleEditDireccion = (dir) => {
    setFormData({
      calle: dir.calle,
      numero: dir.numero,
      pisoDepto: dir.pisoDepto || "",
      ciudad: dir.ciudad,
      provincia: dir.provincia,
      codigoPostal: dir.codigoPostal,
      tipoVivienda: dir.tipoVivienda || "casa",
    });
    setEditId(dir.id);
    setShowForm(true);
  };

  const handleDeleteDireccion = (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta dirección?")) {
      dispatch(deleteDireccion(id));
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({
      calle: "",
      numero: "",
      pisoDepto: "",
      ciudad: "",
      provincia: "Buenos Aires",
      codigoPostal: "",
      tipoVivienda: "casa",
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-700">Mis Direcciones</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-lg font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors"
        >
          {showForm ? "Cancelar" : "Agregar nueva dirección"}
        </button>
      </div>

      {/* Mensajes de error/éxito */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleAddDireccion}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-xl shadow-md mb-8 border"
          >
            <h2 className="text-xl font-semibold mb-4">
              {editId ? "Editar Dirección" : "Nueva Dirección"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="calle"
                value={formData.calle}
                onChange={handleInputChange}
                placeholder="Calle *"
                className="w-full border p-2 rounded"
                required
              />
              <input
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Número *"
                className="w-full border p-2 rounded"
                type="text"
                inputMode="numeric"
                required
              />
              
              <input
                name="pisoDepto"
                value={formData.pisoDepto}
                onChange={handleInputChange}
                placeholder="Piso/Depto (opcional)"
                className="w-full border p-2 rounded"
              />

              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                className="w-full border p-2 rounded bg-white"
                required
              >
                <option value="" disabled>Seleccioná una localidad *</option>
                {localidadesAMBA.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>

              <input
                name="provincia"
                value={formData.provincia}
                onChange={handleInputChange}
                placeholder="Provincia *"
                className="w-full border p-2 rounded"
                required
              />

              <input
                name="codigoPostal"
                value={formData.codigoPostal}
                onChange={handleInputChange}
                placeholder="Código Postal *"
                className="w-full border p-2 rounded"
                required
              />

              <select
                name="tipoVivienda"
                value={formData.tipoVivienda}
                onChange={handleInputChange}
                className="w-full border p-2 rounded bg-white"
              >
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                {editId ? "Actualizar" : "Guardar"} Dirección
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500"
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando direcciones...</p>
        </div>
      )}

      {/* Lista de direcciones */}
      {!loading && (
        <div className="space-y-4">
          {direcciones.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No tenés direcciones cargadas. ¡Agregá una!
            </p>
          ) : (
            direcciones.map((dir) => (
              <motion.div
                key={dir.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white p-5 rounded-xl shadow-md border"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-bold text-lg">
                      {dir.calle} {dir.numero}
                      {dir.pisoDepto && `, ${dir.pisoDepto}`}
                    </p>
                    <p className="text-gray-600">
                      {dir.ciudad}, {dir.provincia}
                    </p>
                    <p className="text-gray-500 text-sm">
                      CP: {dir.codigoPostal} • {dir.tipoVivienda}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditDireccion(dir)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteDireccion(dir.id)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}