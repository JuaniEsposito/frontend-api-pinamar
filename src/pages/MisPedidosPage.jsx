import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMisPedidos } from "../redux/pedidosSlice"; // Ajusta la ruta

export default function MisPedidosPage() {
  const dispatch = useDispatch();

  const {
    pedidos,
    status: pedidosStatus,
    error,
  } = useSelector((state) => state.pedidos);

  useEffect(() => {
    if (pedidosStatus === "idle") {
      dispatch(fetchMisPedidos());
    }
  }, [pedidosStatus, dispatch]);

  const formatFecha = (fechaString) => {
    const opciones = { year: "numeric", month: "long", day: "numeric" };
    return new Date(fechaString).toLocaleDateString("es-ES", opciones);
  };

  const renderContent = () => {
    if (pedidosStatus === "loading") {
      return <p className="text-center text-gray-500">Cargando pedidos...</p>;
    }

    if (pedidosStatus === "failed") {
      return (
        <p className="text-center text-red-500">
          Error al cargar pedidos: {error}
        </p>
      );
    }

    if (pedidosStatus === "succeeded" && pedidos.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-center">
          <p className="text-gray-500">
            Actualmente no tienes pedidos realizados.
          </p>
          <Link
            to="/"
            className="inline-block bg-primary text-white px-4 py-2 rounded font-semibold hover:bg-secondary transition mt-4"
          >
            Empezar a comprar
          </Link>
        </div>
      );
    }

    if (pedidosStatus === "succeeded" && pedidos.length > 0) {
      return (
        <div className="space-y-4">
          {/* Esto mapea y muestra TODAS las órdenes que encontró el slice */}
          {pedidos.map((pedido) => (
            <div
              key={pedido.ordenId}
              className="bg-white rounded-xl shadow border border-gray-100 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    Pedido #{pedido.ordenId}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Realizado el: {formatFecha(pedido.fechaCreacion)}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    pedido.estado === "FINALIZADA"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {pedido.estado}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-gray-600">
                  Dirección: {pedido.direccion}
                </p>
                <p className="text-xl font-bold text-right text-primary mt-2">
                  Total: ${pedido.total.toFixed(2)}
                </p>
              </div>
              {/* --- LINK ELIMINADO --- */}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">Mis Pedidos</h1>
      {renderContent()}
    </div>
  );
}