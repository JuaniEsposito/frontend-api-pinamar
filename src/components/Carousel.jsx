// src/components/Carousel.jsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Estas son las imágenes que usabas, asegúrate de que las rutas sean correctas
import promoBannerImg from "../assets/dino-fanta.jpeg";
import promoBannerImg2 from "../assets/banner3.jpg";
import promoBannerImg4 from "../assets/banner4.webp";

const FALLBACK_IMG = "https://cdn-icons-png.flaticon.com/512/1046/1046857.png";

export default function Carousel() {
  const [banners, setBanners] = useState([]);
  const [idx, setIdx] = useState(0);
  const [imgSrc, setImgSrc] = useState(null);

  // Inicializa los banners
  useEffect(() => {
    setBanners([
      { img: promoBannerImg },
      { img: promoBannerImg2 },
      { img: promoBannerImg4 },
    ]);
  }, []);

  // Actualiza la imagen cuando cambia el índice
  useEffect(() => {
    if (banners.length > 0) {
      setImgSrc(banners[idx]?.img || FALLBACK_IMG);
    }
  }, [idx, banners]);

  const next = () => {
    if (banners.length > 0) {
      setIdx((currentIdx) => (currentIdx + 1) % banners.length);
    }
  };

  const prev = () => {
    if (banners.length > 0) {
      setIdx((currentIdx) => (currentIdx - 1 + banners.length) % banners.length);
    }
  };

  // Rotación automática
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [banners]); // Depende de banners para que inicie cuando se carguen

  if (banners.length === 0) {
    return null; // No renderizar nada si no hay banners
  }

  const { title, desc, cta, to } = banners[idx] || {};

  return (
    <div className="w-full max-w-[1400px] px-2 sm:px-6 mx-auto">
        <div className="relative w-full h-[220px] sm:h-[320px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg mb-10">
            <img
                src={imgSrc}
                alt={title || "Promoción"}
                onError={() => setImgSrc(FALLBACK_IMG)}
                className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />

            <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full w-9 h-9 flex items-center justify-center shadow transition z-20"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
            >
                <span className="text-2xl">&#8592;</span>
            </button>
            <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full w-9 h-9 flex items-center justify-center shadow transition z-20"
                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.07)" }}
            >
                <span className="text-2xl">&#8594;</span>
            </button>

            <div className="relative z-10 flex flex-col justify-center h-full pl-6 sm:pl-16 text-white max-w-[600px]">
                {title && <h2 className="text-2xl sm:text-4xl font-bold mb-2 drop-shadow">{title}</h2>}
                {desc && <p className="mb-4 text-base sm:text-lg">{desc}</p>}
                {to && cta && (
                <Link
                    to={to}
                    className="inline-block font-semibold px-6 py-3 rounded-lg shadow-lg bg-white/90 text-primary border-2 border-primary hover:bg-primary hover:text-white hover:border-white transition text-lg"
                    style={{
                        boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)",
                        fontWeight: 700,
                        letterSpacing: "0.02em",
                    }}
                >
                    {cta}
                </Link>
                )}
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, i) => (
                <span
                    key={i}
                    className={`block w-3 h-3 rounded-full cursor-pointer ${
                    i === idx ? "bg-accent" : "bg-white/60"
                    }`}
                    onClick={() => setIdx(i)}
                ></span>
                ))}
            </div>
        </div>
    </div>
  );
}