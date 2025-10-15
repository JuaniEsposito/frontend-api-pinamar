import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import StepPago from "./StepPago";
import StepEntrega from "./StepEntrega";


// --- DATOS MOCK/PRUEBA (Simulan la API) ---
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
];
// ---------------------------------------------


export default function FinalizarCompraPage() {
  const navigate = useNavigate();
  // Reemplazo del estado de Redux por datos de prueba
  const [carrito, setCarrito] = useState(MOCK_CARRITO_INICIAL);
  const [direcciones, setDirecciones] = useState(MOCK_DIRECCIONES_INICIAL);

  // Estados principales del flujo de compra
  const [direccionId, setDireccionId] = useState(1); // ID de la dirección hardcodeada
  const [envio, setEnvio] = useState(true); // Siempre envío a domicilio
  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(2); // Inicia en el paso 1


  // Calcula el total final de la compra
  const calcularTotal = () => {
    if (!carrito || !Array.isArray(carrito.items) || carrito.items.length === 0)
      return 0;
    let total = 0;
    if (typeof carrito.total === "number" && !isNaN(carrito.total)) {
      total = carrito.total;
    } else {
      total = carrito.items.reduce((sum, item) => {
        if (
          item.subtotal !== undefined &&
          item.subtotal !== null &&
          !isNaN(Number(item.subtotal))
        ) {
          return sum + Number(item.subtotal);
        }
        if (item.precioUnitario !== undefined && item.cantidad !== undefined) {
          return sum + Number(item.precioUnitario) * Number(item.cantidad);
        }
        return sum;
      }, 0);
    }
    return total + 2000;
  };

  // Maneja la selección de método de entrega.
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


  // Simula el pago de forma local para la presentación
  const handlePagar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    alert("¡Pago realizado con éxito!");
    navigate("/");
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
            envio={true} // Asume que siempre es envío a domicilio
            direcciones={direcciones} // Pasa la dirección hardcodeada
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