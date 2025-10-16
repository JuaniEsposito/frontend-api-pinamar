import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { localidadesAMBA } from "../data/localidadesAMBA"; // 1. Importamos nuestro listado

const DIRECCIONES_INICIALES = [
  {
    id: 1,
    calle: "Av. Libertador",
    numero: "1234",
    ciudad: "CABA",
  },
];

export default function MisDireccionesPage() {
  const [direcciones, setDirecciones] = useState(DIRECCIONES_INICIALES);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    calle: "",
    numero: "",
    ciudad: "", // El valor inicial ahora puede ser vacío
  });

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
    if (!formData.calle || !formData.numero || !formData.ciudad) {
      alert("Por favor, completá todos los campos.");
      return;
    }

    const nuevaDireccion = {
      id: Date.now(),
      ...formData,
    };

    setDirecciones([...direcciones, nuevaDireccion]);
    setFormData({ calle: "", numero: "", ciudad: "" });
    setShowForm(false);
  };

  const handleDeleteDireccion = (idAEliminar) => {
    setDirecciones(direcciones.filter((dir) => dir.id !== idAEliminar));
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

      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleAddDireccion}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white p-6 rounded-xl shadow-md mb-8 border"
          >
            <h2 className="text-xl font-semibold mb-4">Nueva Dirección</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="calle"
                value={formData.calle}
                onChange={handleInputChange}
                placeholder="Calle"
                className="w-full border p-2 rounded"
              />
              <input
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                placeholder="Número"
                className="w-full border p-2 rounded"
                type="text"
                inputMode="numeric"
              />
              
              {/* --- 2. REEMPLAZAMOS EL INPUT POR UN SELECT --- */}
              <select
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                className="w-full border p-2 rounded bg-white"
              >
                <option value="" disabled>Seleccioná una localidad</option>
                {localidadesAMBA.map((ciudad) => (
                  <option key={ciudad} value={ciudad}>
                    {ciudad}
                  </option>
                ))}
              </select>

            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Guardar Dirección
            </button>
          </motion.form>
        )}
      </AnimatePresence>

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
              className="bg-white p-5 rounded-xl shadow-md border flex justify-between items-center"
            >
              <div>
                <p className="font-bold text-lg">
                  {dir.calle} {dir.numero}
                </p>
                <p className="text-gray-600">{dir.ciudad}</p>
              </div>
              <button
                onClick={() => handleDeleteDireccion(dir.id)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                Eliminar
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}