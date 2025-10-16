import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import StepPago from "./StepPago";
import StepEntrega from "./StepEntrega";

// --- DATOS MOCK/PRUEBA ---
const MOCK_CARRITO_INICIAL = {
  total: 5750.0,
  items: [
    {
      productoId: 1,
      nombreProducto: "Huevos de Campo",
      cantidad: 4,
      precioUnitario: 1200.0,
      subtotal: 4800.0,
    },
    {
      productoId: 2,
      nombreProducto: "Leche Entera La Serenísima",
      cantidad: 1,
      precioUnitario: 950.0,
      subtotal: 950.0,
    },
  ],
};

const MOCK_DIRECCIONES_INICIAL = [
  {
    id: 1,
    calle: "Av. Corrientes",
    numero: 1234,
    pisoDepto: "Piso 5, Depto. C",
    ciudad: "CABA",
    provincia: "Buenos Aires",
    codigoPostal: "1001",
  },
  {
    id: 2,
    calle: "Av. Santa Fe",
    numero: 4321,
    pisoDepto: "",
    ciudad: "CABA",
    provincia: "Buenos Aires",
    codigoPostal: "1123",
  },
];

export default function FinalizarCompraPage() {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState(MOCK_CARRITO_INICIAL);
  const [direcciones, setDirecciones] = useState(MOCK_DIRECCIONES_INICIAL);

  const [direccionId, setDireccionId] = useState(1);
  const [envio, setEnvio] = useState(true);
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(2);

  const calcularTotal = () => {
    if (!carrito || !Array.isArray(carrito.items) || carrito.items.length === 0)
      return 0;
    let total = carrito.items.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
    // Agregamos el costo de envío solo si está activado
    return envio ? total + 2000 : total;
  };

  const handleSeleccionMetodo = (tipo) => {
    if (tipo === "retiro") {
      setEnvio(false);
      setDireccionId("");
      setStep(2);
    } else {
      setEnvio(true);
      if (direcciones.length > 0) setStep(2);
    }
  };

  // --- FUNCIÓN MODIFICADA ---
  // Ahora recibe un objeto con los detalles del total desde StepPago
  const handlePagar = async (e, { totalFinal, totalOriginal, descuento }) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // --- LÓGICA PARA EL CONTADOR DE PEDIDOS ---
    let currentCount = parseInt(sessionStorage.getItem('orderCounter') || '0', 10);
    currentCount++;
    sessionStorage.setItem('orderCounter', currentCount);
    const newOrderId = String(currentCount).padStart(6, '0');

    const ordenConfirmada = {
      id: newOrderId, // ID secuencial
      items: carrito.items,
      direccion: direcciones.find(d => d.id === parseInt(direccionId))?.calle,
      total: totalFinal, // Total final con descuento
      totalOriginal: totalOriginal, // Total antes del descuento
      descuento: descuento, // Monto del descuento
      fechaCreacion: new Date().toISOString(),
      estado: 'Procesando',
      metodoPago: 'Tarjeta de Crédito',
    };

    setLoading(false);

    navigate(`/mis-pedidos/${ordenConfirmada.id}`, { state: { orden: ordenConfirmada } });
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-green-700 tracking-tight">
        Finalizar compra
      </h2>
      <AnimatePresence mode="wait">
        {step === 1 && (
            <StepEntrega
                key="step-entrega"
                envio={envio}
                direcciones={direcciones}
                handleSeleccionMetodo={handleSeleccionMetodo}
            />
        )}
        {step === 2 && (
          <StepPago
            key="step-pago"
            envio={true}
            direcciones={direcciones}
            direccionId={direccionId}
            setDireccionId={setDireccionId}
            carrito={carrito}
            card={card}
            setCard={setCard}
            calcularTotal={calcularTotal}
            handlePagar={handlePagar}
            loading={loading}
            error={error}
            setStep={setStep}
          />
        )}
      </AnimatePresence>
    </div>
  );
}