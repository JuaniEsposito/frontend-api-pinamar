import { useLocation, Link, Navigate, useNavigate } from "react-router-dom";
import { FaCheckCircle } from 'react-icons/fa';

export default function PedidoDetallePage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Si no hay estado o no hay orden en el estado, redirige de forma segura
  if (!state?.orden) {
    return <Navigate to="/mis-pedidos" replace />;
  }

  const pedido = state.orden;
  const productos = pedido.items || [];
  const fecha = new Date(pedido.fechaCreacion).toLocaleDateString("es-AR", {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const total = typeof pedido.total === "number" ? pedido.total.toFixed(2) : "0.00";
  const subtotal = pedido.subtotal ?? pedido.totalOriginal ?? 0; 
  const descuentoTotal = pedido.descuentoTotal ?? 0;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <div className="text-center mb-8">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800">¡Compra realizada con éxito!</h1>
        <p className="text-gray-600">Gracias por tu compra. Acá tenés el resumen de tu pedido.</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div id="pedido-detalle-pdf">
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Pedido #{String(pedido.ordenId).padStart(6, '0')}
            </h2>
            <span className="text-sm font-medium bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {pedido.estado}
            </span>
          </div>
          <div className="mb-6 text-sm text-gray-500">
            <strong>Fecha:</strong> {fecha} <br />
            <strong>Dirección de entrega:</strong> <span className="font-semibold text-gray-700">{pedido.direccion}</span> <br />
            <strong>Método de pago:</strong> <span className="font-semibold text-gray-700">{pedido.metodoPago}</span>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Productos comprados</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 font-medium">Producto</th>
                  <th className="py-2 font-medium text-center">Cantidad</th>
                  <th className="py-2 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((prod, index) => (
                  <tr key={prod.id || index} className="border-b last:border-b-0">
                    <td className="py-3">{prod.nombreProducto}</td>
                    <td className="py-3 text-center">{prod.cantidad}</td>
                    <td className="py-3 text-right font-semibold">${Number(prod.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-right mt-6 pt-4 border-t space-y-2">
                        {/* 🔑 DESGLOSE USANDO PROPIEDADES REALES DEL BACKEND/STATE */}
                        <div className="text-gray-600">
                            <span>Subtotal (Productos): </span>
                            {/* Usamos el subtotal que viene del body de la orden */}
                            <span className="font-medium">${subtotal.toFixed(2)}</span> 
                        </div>
                        {descuentoTotal > 0 && (
                            <div className="text-red-600">
                                <span>Descuento: </span>
                                <span className="font-medium">-${descuentoTotal.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="font-bold text-xl text-gray-800">
                            Total pagado: ${total}
                        </div>
                    </div>
        </div>
        
        <div className="flex justify-between items-center mt-8">
          <Link to="/mis-pedidos" className="text-green-600 hover:underline text-sm font-medium">
            ← Ver todos mis pedidos
          </Link>
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold text-sm shadow transition"
            onClick={() => navigate("/")}
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}