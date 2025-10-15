import { Link } from "react-router-dom";

export default function MisPedidosPage() {
  return (
    <div className="max-w-3xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6 text-primary">Mis Pedidos</h1>
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
    </div>
  );
}