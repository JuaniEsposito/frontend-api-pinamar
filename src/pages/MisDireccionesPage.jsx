export default function MisDireccionesPage() {
  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">Mis Direcciones</h1>
      <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-center">
        <p className="text-gray-500">
          Aquí podrás ver y administrar tus direcciones de envío.
        </p>
        <button
          className="bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition mt-4"
          onClick={() => alert("Funcionalidad no disponible en la demo")}
        >
          Agregar nueva dirección
        </button>
      </div>
    </div>
  );
}