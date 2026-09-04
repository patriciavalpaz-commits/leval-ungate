'use client';

// Video demo del mecanismo — SIEMPRE click-to-play, NUNCA autoplay de fondo
// (DESIGN-CORE: "solo demo INICIADA POR EL USUARIO con poster estático").
// El poster hace de LCP. Pensado para vivir dentro de un contenedor `relative`
// de aspect-ratio fijo (el frame de teléfono de AppPorDentro): llena ese
// contenedor con object-cover, no define su propio tamaño.

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

export interface VideoDemoProps {
  src: string;
  poster: string;
  posterAlt: string;
}

export function VideoDemo({ src, poster, posterAlt }: VideoDemoProps) {
  const [reproduciendo, setReproduciendo] = useState(false);

  if (reproduciendo) {
    return (
      <video
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        className="h-full w-full object-cover"
        aria-label={posterAlt}
      >
        Tu navegador no puede reproducir este video.
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setReproduciendo(true)}
      aria-label={`Reproducir: ${posterAlt}`}
      className="group absolute inset-0 [touch-action:manipulation]"
    >
      <Image src={poster} alt={posterAlt} fill className="object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-200 group-hover:bg-black/20">
        <span
          className="flex size-12 items-center justify-center rounded-full shadow-[var(--shadow-2)] transition-transform duration-200 group-hover:scale-105"
          style={{ background: 'var(--accent)' }}
        >
          <Play size={20} color="var(--bg)" fill="var(--bg)" className="ml-0.5" />
        </span>
      </span>
    </button>
  );
}
