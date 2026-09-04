// LOGO — Leval Ungate
// El logo real del usuario (public/logo.png), tal cual — pedido explícito
// (2026-08-31): mantenerlo sin recolorear, sin recrear. Es una imagen
// autocontenida (ya trae el fondo negro/dorado y el wordmark "LEVAL UNGATE"
// dentro), así que a tamaño grande NO se le agrega texto al lado (se
// duplicaría); a tamaño chico (nav/footer) sí se acompaña de texto, porque el
// wordmark interno deja de leerse a esa escala.

import Image from 'next/image';

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Leval Ungate"
      width={size}
      height={size}
      className="rounded-[22%] object-contain"
      style={{ width: size, height: size }}
      priority
    />
  );
}

/** Logo grande, autocontenido — para pantallas centradas (login). Sin texto al lado: el wordmark ya vive en la imagen. */
export function LogoGrande({ size = 96 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Leval Ungate"
      width={size}
      height={size}
      className="rounded-[22%] object-contain shadow-[var(--shadow-2)]"
      style={{ width: size, height: size }}
      priority
    />
  );
}
