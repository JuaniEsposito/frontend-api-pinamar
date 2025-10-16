import { useLocation, Link, Navigate, useNavigate } from "react-router-dom";
import { FaCheckCircle } from 'react-icons/fa';

export default function PedidoDetallePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const pedido = state?.orden;

  if (!pedido) {
    return <Navigate to="/mis-pedidos" replace />;
  }

  const productos = pedido.items || [];
  const fecha = new Date(pedido.fechaCreacion).toLocaleDateString("es-AR");
  const total = typeof pedido.total === "number" ? pedido.total.toFixed(2) : "0.00";

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="text-center mb-8">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">¡Compra realizada con éxito!</h1>
        <p className="text-gray-500">Acá tenés el resumen de tu pedido.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div id="pedido-detalle-pdf">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-primary">
              Detalle del Pedido #{pedido.id}
            </h1>
          </div>
          <div className="mb-4 text-sm text-muted">
            Fecha: {fecha} <br />
            Estado: <span className="font-semibold">{pedido.estado}</span>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2 text-dark">
              Productos comprados
            </h2>
            
            {/* --- TABLA DE PRODUCTOS (AHORA SÍ ESTÁ COMPLETA) --- */}
            <table className="w-full text-sm mb-2">
              <thead>
                <tr className="text-left text-muted border-b">
                  <th className="py-1">Producto</th>
                  <th className="py-1">Cantidad</th>
                  <th className="py-1 text-right">Precio unitario</th>
                  <th className="py-1 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="py-2">{prod.nombreProducto}</td>
                    <td className="py-2">{prod.cantidad}</td>
                    <td className="py-2 text-right">${Number(prod.precioUnitario).toFixed(2)}</td>
                    <td className="py-2 text-right font-semibold">${Number(prod.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* --- TOTALES Y DESCUENTO --- */}
            <div className="text-right mt-4 space-y-2">
              {pedido.descuento > 0 && (
                <>
                  <div className="text-gray-600 text-lg">
                    <span>Subtotal: </span>
                    <span>${pedido.totalOriginal.toFixed(2)}</span>
                  </div>
                  <div className="text-green-600 text-lg">
                    <span>Descuento: </span>
                    <span>-${pedido.descuento.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="font-bold text-xl text-primary">
                Total: ${total}
              </div>
            </div>
            
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-dark">
              Forma de entrega y pago
            </h2>
            <div className="text-sm text-muted mb-1">
              Método de pago:{" "}
              <span className="font-semibold">{pedido.metodoPago}</span>
            </div>
            <div className="text-sm text-muted mb-1">
              Dirección de entrega:{" "}
              <span className="font-semibold">{pedido.direccion}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <Link to="/mis-pedidos" className="text-primary hover:underline text-sm">
            ← Ver todos mis pedidos
          </Link>
          <button
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded font-semibold text-sm shadow transition"
            onClick={() => navigate("/")}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}