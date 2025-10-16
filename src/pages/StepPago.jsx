import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Cards from 'react-credit-cards-2'; // Usamos la librería instalada
import 'react-credit-cards-2/dist/es/styles-compiled.css';

export default function StepPago({
  cart,             // ✅ Recibe el carrito REAL
  totalCarrito,     // ✅ Recibe el total REAL
  handlePagar,      // ✅ Recibe la función de pago REAL
  card,
  setCard,
  loading,
  error,
  direcciones,
  direccionId,
  setDireccionId,
  envio,
  setStep,
}) {
  // --- LÓGICA DE VALIDACIÓN Y CUPONES (SE MANTIENE INTACTA) ---
  const [fieldErrors, setFieldErrors] = useState({});
  const [cuponInput, setCuponInput] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [cuponMsg, setCuponMsg] = useState({ text: "", type: "" });
  const [focus, setFocus] = useState('');

  const validateCard = () => {
    const errors = {};
    const number = card.number.replace(/\s/g, "");
    if (!/^\d{16}$/.test(number)) {
      errors.number = "El número debe tener 16 dígitos.";
    }
    if (!card.name.trim() || !/^[a-zA-Z\s]+$/.test(card.name.trim())) {
      errors.name = "Ingresá un nombre válido.";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
      errors.expiry = "El formato debe ser MM/AA.";
    } else {
      const currentYearLastTwoDigits = new Date().getFullYear() % 100;
      const [expMonth, expYear] = card.expiry.split('/');
      if (parseInt(expYear, 10) < currentYearLastTwoDigits || (parseInt(expYear, 10) === currentYearLastTwoDigits && parseInt(expMonth, 10) < new Date().getMonth() + 1)) {
        errors.expiry = "La tarjeta está vencida.";
      }
    }
    if (!/^\d{3,4}$/.test(card.cvv)) {
      errors.cvv = "Debe tener 3 o 4 dígitos.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "number") {
      const digitsOnly = value.replace(/\D/g, "").substring(0, 16);
      setCard({ ...card, number: digitsOnly });
    } else if (name === "expiry") {
      let formattedValue = value.replace(/\D/g, "").substring(0, 4);
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2)}`;
      }
      setCard({ ...card, expiry: formattedValue });
    } else if (name === "cvv") {
        setCard({ ...card, cvv: value.replace(/\D/g, "").substring(0, 4) });
    } else {
      setCard({ ...card, [name]: value });
    }
  };

  const handleInputFocus = (e) => {
    setFocus(e.target.name);
  };
  
  const handleAplicarCupon = () => {
    if (cuponInput.toLowerCase() === "descuento2025") {
      setCuponAplicado(true);
      setCuponMsg({ text: "¡Cupón del 10% aplicado!", type: 'success' });
    } else {
      setCuponAplicado(false);
      setCuponMsg({ text: "Cupón no válido.", type: 'error' });
    }
  };

  // ✅ LÓGICA DE TOTALES ADAPTADA A LOS PROPS REALES
  const totalOriginal = totalCarrito; // El total antes de cupones es el que viene del padre
  const descuento = cuponAplicado ? totalOriginal * 0.10 : 0;
  const totalFinal = totalOriginal - descuento;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateCard()) return;
    // La función handlePagar del padre ya no necesita los detalles del total,
    // los obtiene del contexto.
    handlePagar(e); 
  };
  
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
      {envio && (
        <div className="mb-6">
          <label className="font-semibold block mb-2 text-gray-800">Dirección de envío</label>
          <select className="w-full border rounded p-2 bg-white" value={direccionId} onChange={(e) => setDireccionId(e.target.value)} required>
            <option value="" disabled>Seleccioná una dirección</option>
            {direcciones?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.calle} {d.numero}, {d.ciudad} ({d.codigoPostal})
              </option>
            ))}
          </select>
        </div>
      )}
      
      {/* ✅ SECCIÓN DE PRODUCTOS CORREGIDA */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Productos en tu compra</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Producto</th>
                <th className="text-center py-3 px-4 font-semibold text-sm text-gray-600">Cantidad</th>
                <th className="text-right py-3 px-4 font-semibold text-sm text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {cart?.map((item) => (
                <tr key={item.id} className="border-b last:border-b-0">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={item.imageUrl || 'https://placehold.co/100x100'} alt={item.name} className="w-12 h-12 rounded-md object-contain bg-gray-100" />
                    <span className="font-semibold">{item.name}</span>
                  </td>
                  <td className="text-center py-3 px-4">{item.quantity}</td>
                  <td className="text-right py-3 px-4 font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-5">
            <Cards
              number={card.number}
              expiry={card.expiry}
              cvc={card.cvv}
              name={card.name}
              focused={focus}
            />
        </div>
        
        {/* Inputs para la tarjeta (con tu lógica de validación) */}
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
                <input type="tel" name="number" placeholder="Número de Tarjeta" value={card.number} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 w-full ${fieldErrors.number ? "border-red-400" : ""}`} required disabled={loading} />
                {fieldErrors.number && <div className="text-xs text-red-600 mt-1">{fieldErrors.number}</div>}
            </div>
            <div className="col-span-2">
                <input type="text" name="name" placeholder="Nombre y Apellido" value={card.name} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 w-full ${fieldErrors.name ? "border-red-400" : ""}`} required disabled={loading} />
                {fieldErrors.name && <div className="text-xs text-red-600 mt-1">{fieldErrors.name}</div>}
            </div>
            <div>
                <input type="text" name="expiry" placeholder="MM/AA" value={card.expiry} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 w-full ${fieldErrors.expiry ? "border-red-400" : ""}`} required disabled={loading} />
                {fieldErrors.expiry && <div className="text-xs text-red-600 mt-1">{fieldErrors.expiry}</div>}
            </div>
            <div>
                <input type="password" name="cvv" placeholder="CVV" value={card.cvv} onChange={handleCardInputChange} onFocus={handleInputFocus} className={`border rounded p-2 w-full ${fieldErrors.cvv ? "border-red-400" : ""}`} required disabled={loading} />
                {fieldErrors.cvv && <div className="text-xs text-red-600 mt-1">{fieldErrors.cvv}</div>}
            </div>
        </div>

        {/* Cupón (tu lógica se mantiene) */}
        <div className="mt-6 mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">¿Tenés un cupón de descuento?</label>
          <div className="flex gap-2">
            <input type="text" value={cuponInput} onChange={(e) => setCuponInput(e.target.value)} className="border rounded p-2 flex-grow" disabled={cuponAplicado} />
            <button type="button" onClick={handleAplicarCupon} className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 disabled:opacity-50" disabled={cuponAplicado || !cuponInput}>Aplicar</button>
          </div>
          {cuponMsg.text && <p className={`text-sm mt-2 ${cuponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{cuponMsg.text}</p>}
        </div>

        {/* Totales (tu lógica se mantiene, pero usando el total real) */}
        <div className="mt-6 text-right space-y-2">
          {cuponAplicado && (
            <>
              <div className="text-gray-600" style={{textDecoration: 'line-through'}}>
                <span>Subtotal: </span>
                <span>${totalOriginal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-green-600">
                <span>Descuento (10%): </span>
                <span>-${descuento.toLocaleString("es-AR", { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
          <div className="font-bold text-2xl text-green-700">
            Total: ${totalFinal.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            {envio && <span className="ml-2 text-sm text-gray-500 font-normal">(Incluye envío)</span>}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300" onClick={() => setStep(1)} disabled={loading}>Volver</button>
          <button type="submit" className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 shadow-lg transition disabled:opacity-60" disabled={loading || (envio && !direccionId)}>{loading ? "Procesando..." : "Pagar"}</button>
        </div>
      </form>
    </motion.div>
  );
}