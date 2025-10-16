import { motion } from "framer-motion";
import CreditCard from "../components/CreditCard";
import React, { useState, useMemo } from "react";

export default function StepPago({
  envio,
  direcciones,
  direccionId,
  setDireccionId,
  carrito,
  card,
  setCard,
  calcularTotal,
  handlePagar,
  loading,
  error,
  setStep,
}) {
  const [fieldErrors, setFieldErrors] = useState({});
  const [cuponInput, setCuponInput] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(false);
  const [cuponMsg, setCuponMsg] = useState({ text: "", type: "" });

  const getCardType = (number) => {
    const n = number.replace(/\s/g, "");
    if (/^4/.test(n)) return "Visa";
    if (/^5[1-5]/.test(n)) return "MasterCard";
    if (/^3[47]/.test(n)) return "American Express";
    return "";
  };

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
      const [, year] = card.expiry.split('/');
      if (parseInt(year, 10) <= 24) {
        errors.expiry = "El año de vencimiento debe ser mayor a 24.";
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
      const digitsOnly = value.replace(/\D/g, "");
      const truncated = digitsOnly.substring(0, 16);
      const formatted = truncated.match(/.{1,4}/g)?.join(" ") || "";
      setCard({ ...card, number: formatted });
    } else if (name === "expiry") {
      let formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
      setCard({ ...card, expiry: formattedValue });
    } else {
      setCard({ ...card, [name]: value });
    }
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

  const totalOriginal = useMemo(() => (calcularTotal ? calcularTotal() : 0), [carrito, calcularTotal, envio]);
  const descuento = cuponAplicado ? totalOriginal * 0.10 : 0;
  const totalFinal = totalOriginal - descuento;

  const handleSubmit = (e) => {
  e.preventDefault();
  if (!validateCard()) return;
  // Pasamos un objeto con todos los detalles del total
  handlePagar(e, { totalFinal, totalOriginal, descuento });
};

  const cardType = getCardType(card.number);

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
      {envio && (
        <div className="mb-4">
          <label className="font-semibold block mb-2 text-gray-800">Dirección de envío</label>
          <select
            className="w-full border rounded p-2 bg-white"
            value={direccionId}
            onChange={(e) => setDireccionId(e.target.value)}
            required
          >
            <option value="" disabled>Seleccioná una dirección</option>
            {direcciones?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.calle} {d.numero}, {d.ciudad} ({d.codigoPostal})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-8">
        <div className="font-bold text-xl mb-2 text-blue-700">Productos en tu compra</div>
        <div className="rounded-xl border border-blue-100 bg-gray-50 shadow-sm overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-blue-100 text-blue-800">
                <th className="py-3 px-4 text-left">Producto</th>
                <th className="py-3 px-4 text-left">Cantidad</th>
                <th className="py-3 px-4 text-right">Precio c/u</th>
                <th className="py-3 px-4 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {carrito?.items?.map((item) => (
                <tr key={item.productoId} className="border-t last:border-b-0 border-blue-100">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img alt={item.nombreProducto} className="w-14 h-14 rounded shadow border border-blue-200 object-cover bg-gray-200" />
                    <div><div className="font-semibold">{item.nombreProducto}</div></div>
                  </td>
                  <td className="py-3 px-4">{item.cantidad}</td>
                  <td className="py-3 px-4 text-right">${Number(item.precioUnitario).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <form className="mb-6" onSubmit={handleSubmit} autoComplete="off">
        <div className="mb-5"><CreditCard cardNumber={card.number} name={card.name} expiry={card.expiry} cvv={card.cvv} cardType={cardType} /></div>
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
          <input type="text" name="number" placeholder="1111 1111 1111 1111" value={card.number} onChange={handleCardInputChange} className={`border rounded p-2 ${fieldErrors.number ? "border-red-400" : ""}`} required disabled={loading} inputMode="numeric" />
          {fieldErrors.number && <div className="text-xs text-red-600">{fieldErrors.number}</div>}
          
          <label className="text-sm font-medium text-gray-700 mb-1">Nombre en la tarjeta</label>
          <input type="text" name="name" placeholder="Ej: Juan Pérez" value={card.name} onChange={handleCardInputChange} className={`border rounded p-2 ${fieldErrors.name ? "border-red-400" : ""}`} required disabled={loading} />
          {fieldErrors.name && <div className="text-xs text-red-600">{fieldErrors.name}</div>}
          
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1">Vencimiento</label>
              <input type="text" name="expiry" placeholder="MM/AA" value={card.expiry} onChange={handleCardInputChange} className={`border rounded p-2 w-full ${fieldErrors.expiry ? "border-red-400" : ""}`} required disabled={loading} inputMode="numeric" />
              {fieldErrors.expiry && <div className="text-xs text-red-600">{fieldErrors.expiry}</div>}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input type="password" name="cvv" placeholder="Ej: 123" maxLength={4} value={card.cvv} onChange={handleCardInputChange} className={`border rounded p-2 w-full ${fieldErrors.cvv ? "border-red-400" : ""}`} required disabled={loading} inputMode="numeric" />
              {fieldErrors.cvv && <div className="text-xs text-red-600">{fieldErrors.cvv}</div>}
            </div>
          </div>
        </div>

        <div className="mt-6 mb-4">
          <label className="text-sm font-medium text-gray-700 mb-1 block">¿Tenés un cupón de descuento?</label>
          <div className="flex gap-2">
            <input type="text"  value={cuponInput} onChange={(e) => setCuponInput(e.target.value)} className="border rounded p-2 flex-grow" disabled={cuponAplicado} />
            <button type="button" onClick={handleAplicarCupon} className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 disabled:opacity-50" disabled={cuponAplicado || !cuponInput}>Aplicar</button>
          </div>
          {cuponMsg.text && <p className={`text-sm mt-2 ${cuponMsg.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{cuponMsg.text}</p>}
        </div>

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
          <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition disabled:opacity-60" disabled={loading || (envio && !direccionId)}>{loading ? "Procesando..." : "Pagar"}</button>
        </div>
      </form>
    </motion.div>
  );
}