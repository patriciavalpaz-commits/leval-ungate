// Verificación del webhook de Hotmart (18-VENTA-HOTMART.md, defensa 1 y 2).
// El "hottok" de Hotmart es un secreto compartido enviado tal cual en un header — NO es una
// firma HMAC del cuerpo. Se compara en tiempo constante para no filtrar el secreto por
// temporización (un `===` normal sí filtra, aunque sea una diferencia mínima).

import { timingSafeEqual } from 'node:crypto';

export function hottokValido(hottokRecibido: string | null): boolean {
  const esperado = process.env.HOTMART_HOTTOK;
  if (!esperado) {
    // Fail-secure: sin secreto configurado, ningún webhook se acepta como válido.
    throw new Error('HOTMART_HOTTOK no está configurado en el servidor.');
  }
  if (!hottokRecibido) return false;

  const bufEsperado = Buffer.from(esperado);
  const bufRecibido = Buffer.from(hottokRecibido);
  if (bufEsperado.length !== bufRecibido.length) return false; // timingSafeEqual exige igual largo
  return timingSafeEqual(bufEsperado, bufRecibido);
}

const VENTANA_FRESCURA_MS = 5 * 60 * 1000; // 5 minutos — evita reproducir un aviso viejo capturado

export function eventoFresco(creationDateMs: number | undefined): boolean {
  if (!creationDateMs) return false;
  return Math.abs(Date.now() - creationDateMs) <= VENTANA_FRESCURA_MS;
}
